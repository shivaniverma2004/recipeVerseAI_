"use client"
import { useAuth } from '@/context/AuthContext';
import { Soup } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { toast } from 'react-toastify';

const layout = ({ children }: { children: React.ReactNode }) => {
    const { isAuth, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuth && !loading) {
            toast.error('Please login to access this page');
            router.push('/login');
        }
    }, [isAuth, router, loading]);

    if (!isAuth) {
        return (
            <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
                <Soup className='animate-pulse h-15 w-15 sm:h-20 sm:w-20 text-secondary/30' />
            </div>
        )
    }

    return <div className="px-5 md:px-10">{children}</div>
}

export default layout