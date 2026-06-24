// app/update-password/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import { toast } from 'react-toastify'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const supabase = getSupabaseBrowserClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('Link invalid or expired, please try again')
                router.replace('/forgot-password')
                return
            }
            setChecking(false)
        }
        checkSession()
    }, [router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const supabase = getSupabaseBrowserClient()
        const { error } = await supabase.auth.updateUser({ password })

        setLoading(false)
        toast.dismiss()
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success('Password reset successfully');
        router.push('/login')
    }

    if (checking) {
        return <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
            <Loader2 className='animate-spin h-15 w-15 sm:h-20 sm:w-20 text-primary/30' />
        </div>
    }

    return (
        <main className="flex items-center justify-center py-40 md:py-20 px-5 md:px-10">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute -top-5 left-0 right-0"></div>
            <Card className="rounded-xl border-surface/20 w-md relative z-10 ">
                <CardHeader className='py-3'>
                    <CardTitle className='text-center text-primary-text font-semibold text-2xl'>Reset Password</CardTitle>
                    <CardDescription className='text-center text-sm'>Reset your account password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-3 w-full">
                            <InputGroup className="rounded-sm h-10">
                                <InputGroupInput placeholder="New Password" type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                                <InputGroupAddon>
                                    <Lock />
                                </InputGroupAddon>
                            </InputGroup>

                            <Button variant="hero" className="w-full rounded-sm h-10 mb-2" disabled={loading} >{loading ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </> : 'Update Password'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}