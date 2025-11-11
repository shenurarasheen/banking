'use server'

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";
import { randomUUID } from "crypto";

export const SignIn = async ({email, password} : signInProps) => {
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

export const SignUp = async (userData: SignUpParams) => {
    const {email, password, firstName, lastName} = userData;
    try {
        const { account } = await createAdminClient();

        const idCandidate = ID.unique();
        const isValidId = typeof idCandidate === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/.test(idCandidate);
        const userIdToUse = isValidId ? idCandidate : randomUUID().replace(/[^A-Za-z0-9._-]/g, "").slice(0, 36);

        const newUserAccount = await account.create({
            userId: userIdToUse,
            email,
            password,
            name: `${firstName} ${lastName}`,
        });

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

        return parseStringify(newUserAccount)
    } catch (error) {
        console.log("SignUp error:", error);
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user =  await account.get();
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
