"use client";
import { CardDescription } from '../ui/card'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UserType } from '@/types/user'

const Author = ({ user }: { user: UserType }) => {
    const router = useRouter();

    const handleNavigate = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/users/@${user.username}`)
    }

    return (
        <CardDescription className="text-xs flex items-center gap-2 mt-2">
            <Image src={user.avatar ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${user.avatar}` : "/avatar.png"} width={20} height={20} alt="Chef hat" className="h-5 w-5 rounded-full" />
            <span onClick={handleNavigate} className='font-semibold text-secondary-text'>{user.name}</span>
        </CardDescription>
    )
}

export default Author