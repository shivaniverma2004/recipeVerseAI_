"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import useAuth from '@/hooks/useAuth'


const Page = () => {
    const { register, handleSubmit, onSignUpSubmit, errors, loading } = useAuth();

    return (
        <main className="flex items-center justify-center py-30 md:py-20 px-5 md:px-10">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute -top-5 left-0 right-0"></div>
            <Card className="rounded-xl border-surface/20 w-md relative z-10 ">
                <CardHeader className='py-3'>
                    <CardTitle className='text-center text-primary-text font-semibold text-2xl'>Create Your Account</CardTitle>
                    <CardDescription className='text-center text-sm'>Join RecipeVerse AI Today</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSignUpSubmit)}>
                        <div className="grid gap-3 w-full">

                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Full Name" {...register("name", { required: "Name is required" })} />
                                <InputGroupAddon>
                                    <User />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Username" {...register("username", { required: "Username is required" })} type='text' />
                                <InputGroupAddon>
                                    <User />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Email Address" {...register("email", { required: "Email is required" })} type='email' />
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
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Confirm Password" {...register("confirmPassword", { required: "Confirm Password is required" })} type='password' />
                                <InputGroupAddon>
                                    <Lock />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}

                            <p className="text-primary-text text-center md:text-left">Already have an account? <Link href="/login" className="text-primary">Login</Link></p>
                            <Button variant="hero" className="w-full rounded-sm h-10 mb-2" disabled={loading}>{loading ? "Creating Account..." : "Create Account"}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

export default Page