import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link';
import ProfileImg from './ProfileImg';
import RecipeCard from '@/components/RecipeCard';
import LogoutBtn from './LogoutBtn';
import { getOwnProfile } from '@/lib/actions/user';

const ProfileStats = ({ value, title }: { value: number, title: string }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <h5 className="text-xl font-semibold text-primary-text/80">{value < 10 && value > 0 ? `0${value}` : value}</h5>
            <span className="text-secondary-text/80 text-xs">{title}</span>
        </div>
    )
}

const Page = async () => {
    // get profile information
    const { user, recipes } = await getOwnProfile();

    return (
        <main className="flex min-h-screen flex-col pb-20 md:pb-10">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute top-0 left-0 right-0"></div>
            <div className="container mx-auto flex flex-col gap-4 mt-30 md:mt-10">
                {/* Profile Card */}
                <Card className="px-5 py-6 relative h-fit w-full md:w-full gap-2">
                    <div className="h-20 w-full z-10 bg-primary/30 absolute top-0 left-0 right-0 md:hidden"></div>
                    <CardHeader className="flex flex-col md:flex-row items-center md:justify-start justify-center text-center gap-5 z-20 pt-6">

                        <ProfileImg user={user} />
                        <div className="flex flex-col items-center md:items-start justify-center md:gap-1">
                            <CardTitle className="font-bold text-2xl md:text-2xl text-primary-text">{user.name}</CardTitle>
                            <h2 className="text-secondary-text leading-4 md:text-md">@{user.username}</h2>
                            <p className="text-secondary-text py-2 md:text-md md:text-left">{user.bio}</p>
                        </div>

                    </CardHeader>
                    <CardContent className="flex justify-around md:justify-start md:gap-10 lg:gap-20 md:pl-[140px]">
                        <ProfileStats value={recipes.length} title="Recipes" />
                        <ProfileStats value={user.followers} title="Followers" />
                        <ProfileStats value={user.following} title="Following" />
                    </CardContent>
                    <div className="flex flex-col sm:flex-row justify-center md:justify-start w-full gap-2 mt-2 md:gap-2 lg:gap-5 md:pl-[140px] lg:pr-[10%]">
                        <Button variant="default" asChild size="sm" className='flex-1 h-10 py-2 text-sm border border-primary'>
                            <Link href="/profile/edit">
                                Edit Profile
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className='flex-1 h-10 py-2 text-sm text-secondary border-secondary hover:text-white hover:bg-secondary'>
                            <Link href="/profile/password">
                                Change Password
                            </Link>
                        </Button>
                        <LogoutBtn />
                    </div>
                </Card>

                {recipes && recipes.length > 0 ? (
                    <div className="grow">
                        <div className="mt-3 mb-4">
                            <h2 className="text-2xl font-bold text-primary-text">Published Recipes</h2>
                            <p className="mt-1 max-w-2xl text-sm text-secondary-text">
                                Recipes published by yours truly
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} isEdit={true} />
                            ))}
                        </div>
                    </div>
                ) : ''}
            </div>
        </main>
    )
}

export default Page