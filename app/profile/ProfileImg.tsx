"use client"

import Image from 'next/image'
import { ImageUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { profileUpload } from '@/lib/actions/profile'
import { useAuth } from '@/context/AuthContext'

const ProfileImg = ({ user }: { user: any }) => {
    const { updateUser } = useAuth();
    const [avatar, setAvatar] = useState(user?.avatar ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${user?.avatar}`: '/avatar.png')

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatar(URL.createObjectURL(file))
            try {
                const res = await profileUpload(file)
                updateUser();
                if (!res.success) {
                    throw new Error(res.error)
                }
                toast.success("Profile picture updated successfully!")
            } catch (error: any) {
                toast.error(error.message)
            }
        }
    }


    return (
        <div className="relative group">
            <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <label htmlFor="avatar" className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-80 transition-opacity duration-300 cursor-pointer">
                <ImageUp className="text-white text-xl" />
            </label>
            <Image
                src={avatar ?? '/avatar.png'}
                height={100}
                width={100}
                alt='Profile Pic'
                className='rounded-full ring-3 ring-primary h-[100px]'
            />
        </div>
    )
}

export default ProfileImg