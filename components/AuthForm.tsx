"use client"

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomInput from "./CustomInput";
import { authFormSchema } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getLoggedInUser, SignIn, SignUp } from "@/lib/actions/user.actions";

const AuthForm = ({ type }: { type: string }) => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            dateOfBirth: "",
            ssn: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            if (type === 'sign-up') {
                const newUser = await SignUp(data);
                console.log(newUser)
                setUser(data);
            }

            if (type === 'sign-in') {
                const res = await SignIn({
                    email: data.email,
                    password: data.password
                });

                if (res) router.push('/');
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="auth-form">
            <header className="flex flex-col gap-5 md:gap-8">
                <Link
                    href="/"
                    className="flex cursor-pointer items-center gap-1"
                >
                    <Image
                        src="/icons/logo.svg"
                        width={34}
                        height={34}
                        alt="Horizon Logo"
                    />
                    <h1 className="text-26 font-ibm-plex-serif font-bold text-black">Horizon</h1>
                </Link>

                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                        {user ?
                            'Link Account'
                            : type === 'sign-in' ?
                                'Sign In'
                                :
                                'Sign Up'}
                        <p className="text-16 font-normal text-gray-600">
                            {user ?
                                'Link your account to get started' :
                                'Please enter your details'}
                        </p>
                    </h1>
                </div>
            </header>
            {user ? (
                <div className="flex flex-col gap-4">
                    {/* PlaidLink */}
                </div>
            ) : (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {type === 'sign-up' && (
                                <>
                                    <div className="flex gap-4">
                                        <CustomInput
                                            control={form.control}
                                            name="firstName"
                                            label="First Name"
                                            placeholder="ex: John"
                                        />
                                        <CustomInput
                                            control={form.control}
                                            name="lastName"
                                            label="Last Name"
                                            placeholder="ex: Doe"
                                        />
                                    </div>
                                    <CustomInput
                                        control={form.control}
                                        name="address"
                                        label="Address"
                                        placeholder="Enter your specific address"
                                    />
                                    <CustomInput
                                        control={form.control}
                                        name="city"
                                        label="City"
                                        placeholder="Enter your City"
                                    />
                                    <div className="flex gap-4">
                                        <CustomInput
                                            control={form.control}
                                            name="state"
                                            label="State"
                                            placeholder="ex: NY"
                                        />
                                        <CustomInput
                                            control={form.control}
                                            name="postalCode"
                                            label="Postal Code"
                                            placeholder="ex: 11101"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <CustomInput
                                            control={form.control}
                                            name="dateOfBirth"
                                            label="Date of Birth"
                                            placeholder="yyyy-MM-dd"
                                        />
                                        <CustomInput
                                            control={form.control}
                                            name="ssn"
                                            label="SSN"
                                            placeholder="ex: 1234"
                                        />
                                    </div>
                                </>
                            )}
                            <CustomInput
                                control={form.control}
                                name="email"
                                label="Email"
                                placeholder="Enter your email"
                            />
                            <CustomInput
                                control={form.control}
                                name="password"
                                label="Password"
                                placeholder="Enter your password"
                            />
                            <div className="flex flex-col gap-4">
                                <Button type="submit" className="form-btn" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                                        </>
                                    ) : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <footer className="flex justify-center gap-1">
                        <p className="text-14 font-normal text-gray-600">
                            {type === 'sign-in' ?
                                "don't have an account?" :
                                "already have an account?"} &nbsp;
                            <Link className="form-link" href={type === 'sign-in' ? '/sign-up' : 'sign-in'}>
                                {type === 'sign-in' ? "Sign Up" : "Sign In"}
                            </Link>
                        </p>
                    </footer>
                </>
            )}
        </section>
    )
}

export default AuthForm;