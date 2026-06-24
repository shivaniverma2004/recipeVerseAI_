"use client"
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BookmarkPlus, LayoutPanelLeft, LogOut, Search, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const ProfileStats = ({ value, title }: { value: number, title: string }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <h5 className="text-xl font-semibold text-primary-text/80">{value < 10 && value > 0 ? `0${value}` : value}</h5>
            <span className="text-secondary-text/80 text-xs">{title}</span>
        </div>
    )
}

const Sidebar = () => {
    const { user, isAuth, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/login");
            toast.success("Logout successful");
        } catch (error) {
            toast.error("Logout failed");
        }
    }

    return (
        <>
            <div className="hidden md:block w-64 min-w-64"></div>
            <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 min-w-64 h-screen bg-surface flex-col items-center overflow-y-auto">
                <div className="pt-3 px-4">
                    <Link href="/"><Image src="/logo.png" loading="eager" alt="Logo" width={200} height={50} className="w-fit h-11" /></Link>
                </div>
                {isAuth && user ? <Card className="bg-transparent ring-0 w-full">
                    <CardHeader className="flex flex-col items-center justify-center text-center z-20 pt-6">
                        <Image
                            src={user.avatar ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${user?.avatar}` : "/avatar.png"}
                            height={85}
                            width={85}
                            alt='Profile Pic'
                            className='rounded-full ring-3 border-2 border-white ring-primary h-21 w-21'
                        />
                        <div className="flex flex-col items-center justify-center pt-2">
                            <CardTitle className="font-semibold text-xl text-primary-text">{user.name}</CardTitle>
                            <h2 className="text-secondary-text text-xs leading-4">@{user.username}</h2>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-around py-2 w-full">
                        <ProfileStats value={user.recipes} title="Recipes" />
                        <ProfileStats value={user.followers} title="Followers" />
                        <ProfileStats value={user.following} title="Following" />
                    </CardContent>
                    {/* <Button variant="default" size="lg">Edit Profile</Button> */}
                </Card> : <div className="flex flex-col items-center justify-center text-center z-20 pt-6">

                </div>}

                <nav className="flex flex-col flex-1 w-full pl-2">
                    <ul className='w-full'>
                        <li className="mb-1">
                            <Link href="/" className={`text-sm w-full flex items-center gap-2 hover:text-primary border-r-2 hover:border-primary py-2 px-3 rounded-none transition-all duration-150 ${pathname === "/" ? "border-primary text-primary" : "border-transparent text-primary-text/80"}`}>
                                <LayoutPanelLeft size={20} className='font-boldbold' />
                                <span className='font-semibold'>Feed</span>
                            </Link>
                        </li>
                        <li className="mb-1">
                            <Link href="/explore" className={`text-sm w-full flex items-center gap-2 hover:text-primary border-r-2 hover:border-primary py-2 px-3 rounded-none transition-all duration-150 ${pathname === "/explore" ? "border-primary text-primary" : "border-transparent text-primary-text/80"}`}>
                                <Search size={20} className='font-boldbold' />
                                <span className='font-semibold'>Explore</span>
                            </Link>
                        </li>
                        <li className="mb-1">
                            <Link href="/profile/recipes/add" className={`text-sm w-full flex items-center gap-2 hover:text-primary border-r-2 hover:border-primary py-2 px-3 rounded-none transition-all duration-150 ${pathname === "/profile/recipes/add" ? "border-primary text-primary" : "border-transparent text-primary-text/80"}`}>
                                <BookmarkPlus size={20} className='font-boldbold' />
                                <span className='font-semibold'>Create</span>
                            </Link>
                        </li>
                        {isAuth ? (
                            <li className="mb-1">
                                <Link href="/profile" className={`text-sm w-full flex items-center gap-2 hover:text-primary border-r-2 hover:border-primary py-2 px-3 rounded-none transition-all duration-150 ${pathname === "/profile" ? "border-primary text-primary" : "border-transparent text-primary-text/80"}`}>
                                    <User size={20} className='font-boldbold' />
                                    <span className='font-semibold'>Profile</span>
                                </Link>
                            </li>
                        ) : (
                            <li className="mb-1">
                                <Link href="/login" className={`text-sm w-full flex items-center gap-2 hover:text-primary border-r-2 hover:border-primary py-2 px-3 rounded-none transition-all duration-150 ${pathname === "/login" ? "border-primary text-primary" : "border-transparent text-primary-text/80"}`}>
                                    <User size={20} className='font-boldbold' />
                                    <span className='font-semibold'>Login</span>
                                </Link>
                            </li>
                        )}
                    </ul>

                    {isAuth ? (
                        <div className="mb-1 mt-auto pb-2">
                            <div className="border-t border-secondary-text/20 mx-3 pt-2"></div>
                            <p onClick={handleLogout} className='text-sm w-full flex items-center gap-2 text-primary-text/80 hover:text-red-500 border-r-2 border-transparent hover:border-red-500 py-2 px-3 rounded-none transition-all duration-150 cursor-pointer'>
                                <LogOut size={20} className='font-boldbold' />
                                <span className='font-semibold'>Logout</span>
                            </p>
                        </div>
                    ) : (
                        <div className="mb-1 mt-auto pb-2">
                            <div className="border-t border-secondary-text/20 mx-3 pt-2"></div>
                            <Link href="/signup" className={`text-sm w-full flex items-center gap-2 hover:text-primary border-r-2 hover:border-primary py-2 px-3 rounded-none transition-all duration-150 ${pathname === "/signup" ? "border-primary text-primary" : "border-transparent text-primary-text/80"}`}>
                                <User size={20} className='font-boldbold' />
                                <span className='font-semibold'>Create Account</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>
        </>
    )
}

export default Sidebar