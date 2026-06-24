'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import { Loader2, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function ForgotPassForm() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (message) {
            toast.error(message)
        }
    }, [message])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const supabase = getSupabaseBrowserClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/confirm?next=/update-password`,
        })

        setLoading(false)
        toast.dismiss()
        toast[error ? 'error' : 'success'](
            error
                ? error.message || 'Something went wrong, please try again.'
                : 'Check your email, reset link has been sent.'
        )
        if (!error) setEmail('');
    }

    return (
        <main className="flex items-center justify-center py-40 md:py-20 px-5 md:px-10">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute -top-5 left-0 right-0"></div>
            <Card className="rounded-xl border-surface/20 w-md relative z-10 ">
                <CardHeader className='py-3'>
                    <CardTitle className='text-center text-primary-text font-semibold text-2xl'>Forgot Password</CardTitle>
                    <CardDescription className='text-center text-sm'>Get access to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-3 w-full">
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="Email Address" type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                                <InputGroupAddon>
                                    <Mail />
                                </InputGroupAddon>
                            </InputGroup>

                            <Button variant="hero" className="w-full rounded-sm h-10 mb-2" disabled={loading} >{loading ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </> : 'Send Reset Link'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}