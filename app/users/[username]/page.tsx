import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import RecipeCard from '@/components/RecipeCard';
import { getByUsername } from '@/lib/actions/user';
import FollowAction from './FollowAction';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const supabase = await createSupabaseServerClient();
    const { username } = await params;

    const { data: user } = await supabase
        .from('profiles')
        .select(`name, bio`)
        .eq('username', decodeURIComponent(username).replaceAll("@", ""))
        .single();

    if (!user) {
        return {
            title: "RecipeVerse",
            description: "AI-powered recipe discovery and cooking assistant",
        }
    }

    return {
        title: `${user.name} - RecipeVerse`,
        description: user.bio,
    }
}

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
    const { username } = await params;

    const { user, recipes, isMe } = await getByUsername(username);

    return (
        <main className="flex min-h-screen flex-col pb-20 md:pb-10 px-5 md:px-10">
            <div className="h-72 w-full bg-primary/10 -skew-y-6 absolute top-0 left-0 right-0"></div>
            <div className="container mx-auto flex flex-col gap-4 mt-30 md:mt-10">
                {/* Profile Card */}
                <Card className="px-5 py-6 relative h-fit w-full md:w-full gap-2">
                    <div className="h-20 w-full z-10 bg-primary/30 absolute top-0 left-0 right-0 md:hidden"></div>
                    <CardHeader className="flex flex-col md:flex-row items-center md:justify-start justify-center text-center gap-5 z-20 pt-6">

                        <div className="relative group">
                            <Image
                                src={user.avatar ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${user?.avatar}` : "/avatar.png"}
                                height={100}
                                width={100}
                                alt='Profile Pic'
                                className='rounded-full ring-3 ring-primary h-[100px]'
                            />
                        </div>

                        <div className="flex flex-col items-center md:items-start justify-center md:gap-1">
                            <CardTitle className="font-bold text-2xl md:text-2xl text-primary-text">{user.name}</CardTitle>
                            <h2 className="text-secondary-text leading-4 md:text-md">@{user.username}</h2>
                            <p className="text-secondary-text py-2 md:text-md md:text-left">{user.bio}</p>
                        </div>

                    </CardHeader>
                    <FollowAction recipesCount={recipes.length} user={user} isMe={isMe} />
                </Card>

                {recipes && recipes.length > 0 ? (
                    <div className="grow">
                        <div className="mt-3 mb-4">
                            <h2 className="text-2xl font-bold text-primary-text">Published Recipes</h2>
                            <p className="mt-1 max-w-2xl text-sm text-secondary-text">
                                Recipes published by {user.name}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} isEdit={false} />
                            ))}
                        </div>
                    </div>
                ) : ''}
            </div>
        </main>
    )
}

export default Page