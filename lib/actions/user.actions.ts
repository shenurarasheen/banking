'use server'

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { randomUUID } from "crypto";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID
} = process.env;

export const SignIn = async ({ email, password }: signInProps) => {
    try {
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(email, password);

        //newer code
        const cookieStore = await cookies();
        const cookieValue = session?.secret;
        if (!cookieValue) throw new Error('Missing session identifier form appwrite session.');
        cookieStore.set({
            name: 'appwrite-session',
            value: cookieValue,
            path: '/',
            httpOnly: true,
            sameSite: 'strict'
        })

        return parseStringify(session);
    } catch (error) {
        console.log("SignIn error:", error);
    }
}

export const SignUp = async ({password, ...userData}: SignUpParams) => {
    const { email, firstName, lastName } = userData;
    let newUserAccount;
    try {
        const { account, database } = await createAdminClient();

        const idCandidate = ID.unique();
        const isValidId = typeof idCandidate === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/.test(idCandidate);
        const userIdToUse = isValidId ? idCandidate : randomUUID().replace(/[^A-Za-z0-9._-]/g, "").slice(0, 36);

        newUserAccount = await account.create({
            userId: userIdToUse,
            email,
            password,
            name: `${firstName} ${lastName}`,
        });

        if (!newUserAccount) throw new Error("Error creating user");

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData, //except the password
            type: 'personal'
        });

        if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla customer");

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

        console.info("SignUp: creating DB document");
        const newUser = await database.createDocument(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl
            }
        );

        const session = await account.createEmailPasswordSession({
            email,
            password
        });

        const cookieStore = await cookies();

        if (!session || !session.secret) {
            throw new Error("Missing session secret");
        }

        // cookieStore.set("appwrite-session", session.secret, {
        //     path: "/",
        //     httpOnly: true,
        //     sameSite: "strict",
        //     secure: true,
        // });

        cookieStore.set({
            name: 'appwrite-session',
            value: session?.secret,
            path: '/',
            httpOnly: true,
            sameSite: 'strict'
        });

        return parseStringify(newUser)
    } catch (error) {
        console.log("SignUp error:", error);
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        return parseStringify(user);
    } catch (error) {
        console.log('getLoggedInUser failed', error);
        return null;
    }
}

export const signOutAccount = async () => {
    try {
        const { account } = await createSessionClient();
        (await cookies()).delete('appwrite-session');
        await account.deleteSession('current');
    } catch (error) {
        return null;
    }
}

export const createLinkToken = async (user: User) => {
    try {
        console.log(user);
        const tokenParams = {
            user: {
                client_user_id: user.$id,
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[]
        }
        const res = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({ linkToken: res.data.link_token });
    } catch (error) {
        console.log(error);
    }
}

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId
            }
        )

        return parseStringify(bankAccount);
    } catch (error) {
        console.log(error);
    }
}

export const exchangePublicToken = async ({
    publicToken,
    user
}: exchangePublicTokenProps) => {
    try {
        //Exchange public token for access token and item ID
        const res = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken
        });

        const accessToken = res.data.access_token;
        const itemId = res.data.item_id;

        //Get account information from Plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken
        });

        const accountData = accountsResponse.data.accounts[0];

        //Create a processor token for Dwolla using the access token and account ID.
        const req: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(req);
        const processorToken = processorTokenResponse.data.processor_token;

        //Create a funding source URL for the account using the Dwolla customer ID, processor token and 
        //bank name.
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name
        });

        //If the funding source URL is not created, throw an error
        if (!fundingSourceUrl) throw new Error("Funding source url not found");

        //Create bank account using the user ID, item ID, account ID, access token, funding source URL and sharable ID.
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id)
        });

        //Revalidate the path to reflect the changes
        revalidatePath("/");

        //Return a success message
        return parseStringify({
            publicTokenExchange: "complete"
        });

    } catch (error) {
        console.log("An error occured while creating exchanging token", error);
    }
}
