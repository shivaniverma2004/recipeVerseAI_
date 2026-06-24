"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Astroid, Home, Plus, Search, User } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { useAuth } from '@/context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'

const Navbar = () => {
    const { defineQ } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();

    const router = useRouter();

    const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (searchQuery.trim().length < 2) return;

        if (e.key === 'Enter') {
            defineQ(searchQuery);
            setSearchQuery('')
            router.push(`/explore`)
        }
    }
    return (
        <>
            <nav className='hidden md:block sticky top-0 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-surface/20'>
                <div className="h-20 flex items-center justify-between text-primary-text px-10">
                    <InputGroup className={`h-10 w-[60%] rounded-full px-2 ${pathname === "/explore" || pathname === "/profile/recipes/add" ? "hidden" : "flex"}`}>
                        <InputGroupInput placeholder="Search Recipes" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSubmit} />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <Link href="/profile/recipes/add" className={`${pathname === "/profile/recipes/add" ? "hidden" : "flex"} ml-auto`}>
                        <Button variant="hero" className='px-6 py-5 rounded-xl'>
                            <Plus size={20} /> Add Recipes
                        </Button>
                    </Link>
                </div>
            </nav>
            <div className='fixed md:hidden top-0 left-0 right-0 z-50 h-16 flex items-center justify-between text-primary-text px-5 bg-white/90 backdrop-blur-lg border-b border-surface/20'>
                <Image src="/logo.png" loading="eager" alt="Logo" width={200} height={50} className="w-fit h-10" />
            </div>
            <nav className='fixed md:hidden bottom-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-lg border-b border-surface/20'>
                <ul className='w-full grid grid-cols-5 justify-center items-center px-3 h-full'>
                    <li className='mx-auto'>
                        <Link href="/" className={`text-sm w-full flex items-center gap-0 hover:text-primary rounded-none transition-all duration-150 flex-col ${pathname === "/" ? "text-primary" : "text-primary-text/80"}`}>
                            <Home size={22} className='font-normal' />
                            <span className='font-normal'>Feed</span>
                        </Link>
                    </li>
                    <li className='mx-auto'>
                        <Link href="/explore" className={`text-sm w-full flex items-center gap-0 hover:text-primary rounded-none transition-all duration-150 flex-col ${pathname === "/explore" ? "text-primary" : "text-primary-text/80"}`}>
                            <Search size={22} className='font-normal' />
                            <span className='font-normal'>Explore</span>
                        </Link>
                    </li>
                    <li className='mx-auto'>
                        <Link href="/profile/recipes/add" className='text-sm flex items-center justify-center gap-0 text-white rounded-full transition-all duration-150 flex-col bg-primary h-13 w-13'>
                            <Plus size={22} className='font-normal' />
                        </Link>
                    </li>
                    <li className='mx-auto'>
                        <Link href="/ai-assistant" className={`text-sm w-full flex items-center gap-0 hover:text-primary rounded-none transition-all duration-150 flex-col ${pathname === "/ai-assistant" ? "text-primary" : "text-primary-text/80"}`}>
                            <Astroid size={22} className='font-normal' />
                            <span className='font-normal'>Assistant</span>
                        </Link>
                    </li>
                    <li className='mx-auto'>
                        <Link href="/profile" className={`text-sm w-full flex items-center gap-0 hover:text-primary rounded-none transition-all duration-150 flex-col ${pathname === "/profile" ? "text-primary" : "text-primary-text/80"}`}>
                            <User size={22} className='font-normal' />
                            <span className='font-normal'>Profile</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Navbar