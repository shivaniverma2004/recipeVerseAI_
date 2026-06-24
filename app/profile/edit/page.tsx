"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import useProfile from '@/hooks/useProfile'
import { Loader2, Mail, Pencil, User } from 'lucide-react'

const Page = () => {
    const { register, handleSubmit, errors, loading, onSubmit } = useProfile();

    return (
        <main className="flex items-center justify-center py-30 md:py-20">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute -top-5 left-0 right-0"></div>
            <Card className="rounded-xl border-surface/20 w-md relative z-10 ">
                <CardHeader className='py-3'>
                    <CardTitle className='text-center text-primary-text font-semibold text-2xl'>Edit Your Profile</CardTitle>
                    <CardDescription className='text-center text-sm'>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-3 w-full">
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Full Name" {...register("name", { required: "Name is required" })} />
                                <InputGroupAddon>
                                    <User />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Email Address" {...register("email", { required: "Email is required" })} type='email' />
                                <InputGroupAddon>
                                    <Mail />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            <InputGroup className="rounded-sm h-10 flex items-start">
                                <InputGroupTextarea placeholder="Bio" {...register("bio", { required: "Bio is required" })} />
                                <InputGroupAddon className='mt-1'>
                                    <Pencil />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}

                            <Button variant="hero" className="w-full rounded-sm h-10 mb-2" disabled={loading} >{loading ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </> : 'Update Profile'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

export default Page