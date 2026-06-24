"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { updatePassword } from '@/lib/actions/profile'

type Inputs = {
    current_password: string;
    new_password: string;
};


const Page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true);

        if (data.new_password.length < 8) {
            setError("new_password", {
                message: "Password must be at least 8 characters long",
                type: "manual",
            });
            setLoading(false);
            return;
        }

        if (data.current_password === data.new_password) {
            setError("new_password", {
                message: "New password must be different from current password",
                type: "manual",
            });
            setLoading(false);
            return;
        }

        try {
            await updatePassword(data.current_password, data.new_password);

            toast.success("Password updated successfully!");
            router.push("/profile");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center py-40 md:py-20">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute -top-5 left-0 right-0"></div>
            <Card className="rounded-xl border-surface/20 w-md relative z-10 ">
                <CardHeader className='py-3'>
                    <CardTitle className='text-center text-primary-text font-semibold text-2xl'>Update Password</CardTitle>
                    <CardDescription className='text-center text-sm'>Change your password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-3 w-full">
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Current Password" {...register("current_password", { required: "Current password is required" })} type="password" />
                                <InputGroupAddon>
                                    <Lock />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.current_password && <p className="text-red-500 text-sm">{errors.current_password.message}</p>}
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="New Password" {...register("new_password", { required: "New password is required" })} type='password' />
                                <InputGroupAddon>
                                    <Lock />
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.new_password && <p className="text-red-500 text-sm">{errors.new_password.message}</p>}

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