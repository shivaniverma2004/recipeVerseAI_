"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import useAuth from '@/hooks/useAuth';
import { Lock, Mail } from 'lucide-react'
import Link from 'next/link'


const Page = () => {
    const { onLoginSubmit, register, errors, handleSubmit, loading } = useAuth();
    return (
        <main className="flex  items-center justify-center py-30 md:py-20 px-5 md:px-10">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute -top-5 left-0 right-0"></div>
            <Card className="rounded-xl border-surface/20 w-md relative z-10 mt-15 md:mt-10">
                <CardHeader className='py-3'>
                    <CardTitle className='text-center text-primary-text font-semibold text-2xl'>Login Your Account</CardTitle>
                    <CardDescription className='text-center text-sm'>Get access to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onLoginSubmit)}>
                        <div className="grid gap-3 w-full">

                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Email Address" {...register("email", { required: "Email is required" })} />
                                <InputGroupAddon>
                                    <Mail />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Password" {...register("password", { required: "Password is required" })} type='password' />
                                <InputGroupAddon>
                                    <Lock />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

                            <div className="flex w-full items-center justify-between flex-col md:flex-row-reverse">
                                <Link href="/forgot-password" className="text-primary-text text-sm font-semibold">Forgot Password?</Link>
                                <p className="text-primary-text text-left">Don't have an account? <Link href="/signup" className="text-primary">Sign up</Link></p>
                            </div>
                            <Button variant="hero" className="w-full rounded-sm h-10 mb-2" disabled={loading}>{loading ? "Login..." : "Login"}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

export default Page