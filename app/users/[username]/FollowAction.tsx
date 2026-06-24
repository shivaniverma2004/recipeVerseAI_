"use client"

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { addFollow, unFollow } from '@/lib/actions/user'
import { UserWithCountType } from '@/types/user'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-toastify'

const ProfileStats = ({ value, title }: { value: number, title: string }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <h5 className="text-xl font-semibold text-primary-text/80">{value < 10 && value > 0 ? `0${value}` : value}</h5>
            <span className="text-secondary-text/80 text-xs">{title}</span>
        </div>
    )
}

const FollowAction = ({ recipesCount, user, isMe }: { recipesCount: number, user: UserWithCountType, isMe: boolean }) => {
    const [isFollowing, setIsFollowing] = useState(user.isFollowing);
    const [followers, setFollowers] = useState(user.followers);
    const { fetchUser } = useAuth();

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await unFollow(user.id);
                toast.success("Unfollowed successfully!");
                setFollowers(followers - 1);
            } else {
                await addFollow(user.id);
                toast.success("Followed successfully!");
                setFollowers(followers + 1);
            }
            setIsFollowing(!isFollowing)
            fetchUser();
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    return (
        <>
            <CardContent className="flex justify-around md:justify-start md:gap-10 lg:gap-20 md:pl-[140px]">
                <ProfileStats value={recipesCount} title="Recipes" />
                <ProfileStats value={followers} title="Followers" />
                <ProfileStats value={user.following} title="Following" />
            </CardContent>
            {isMe ? (
                <div className="flex flex-col sm:flex-row justify-center md:justify-start w-full gap-2 mt-2 md:gap-2 lg:gap-5 md:pl-[140px] lg:pr-[20%]">
                    <Button asChild variant="outline" size="sm" className={`flex-1 h-10 py-2 text-sm border border-primary text-primary hover:text-primary-foreground hover:bg-primary cursor-pointer`}>
                        <Link href="/profile">Go To Profile</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row justify-center md:justify-start w-full gap-2 mt-2 md:gap-2 lg:gap-5 md:pl-[140px] lg:pr-[20%]">
                    <Button onClick={handleFollow} variant="default" size="sm" className={`flex-1 h-10 py-2 text-sm border cursor-pointer ${isFollowing ? "border-secondary-text bg-secondary-text hover:bg-secondary-text text-white" : "border-primary"}`}>
                        {isFollowing ? "Unfollow" : "Follow Now"}
                    </Button>
                </div>
            )}
        </>
    )
}

export default FollowAction