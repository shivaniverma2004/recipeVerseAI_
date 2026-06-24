import { Suspense } from 'react'
import ForgotPassForm from './ForgotPassForm'

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ForgotPassForm />
        </Suspense>
    )
}