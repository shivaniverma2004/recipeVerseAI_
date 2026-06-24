import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { CircleCheckBig, CookingPot, Earth, HandPlatter, Layers, Puzzle, Sailboat, Timer, User, Users } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FavBtn from '@/components/RecipeCard/FavBtn';
import { minsToText } from '@/utils/mins-text';
import AskAI from './AskAi';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { data: recipeData } = await supabase
        .from('recipes')
        .select(`title, description`)
        .eq('id', id)
        .single();

    if (!recipeData) {
        return {
            title: "RecipeVerse",
            description: "AI-powered recipe discovery and cooking assistant",
        }
    }

    return {
        title: `${recipeData.title} - RecipeVerse`,
        description: recipeData.description,
    }
}


const TimeCard = ({ value, title, icon, className }: { value: string, title: string, icon: any, className?: string }) => {
    return (
        <div className={`flex gap-3 items-center justify-center ${className}`}>
            {icon}
            <div className="flex flex-col">
                <span className="text-xs text-primary-text/80 font-light uppercase ">{title}</span>
                <span className="text-md font-semibold text-primary-text/80 pt-0.5 capitalize">{value}</span>
            </div>
        </div>
    )
}


const PreparatonStep = ({ step, title, description }: { step: string, title: string, description: string }) => {
    return <div className="flex gap-3 items-start justify-start">
        <h2 className="text-2xl font-semibold text-primary">{step}</h2>
        <div className="flex flex-col">
            <span className="text-lg text-primary-text/80 font-semibold">{title}</span>
            <span className="text-secondary-text/80 pt-0.5 ">{description}</span>
        </div>
    </div>
}

const IngredientStep = ({ name, quantity, unit }: { name: string, quantity: string, unit: string }) => {
    return <div className="flex gap-3 items-center justify-start">
        <h2 className="text-2xl font-semibold text-primary">
            <CircleCheckBig size={20} />
        </h2>
        <div className="">
            <span className="text-base text-primary-text/80 font-semibold">{name}</span>
            <span className="text-secondary-text/80 pt-0.5 ">- {quantity}{unit}</span>
        </div>
    </div>
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    // get profile information
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { data: recipeData } = await supabase
        .from('recipes')
        .select(`*, profiles (username,name,avatar), recipe_loves(count)`)
        .eq('id', id)
        .single();

    if (!recipeData) {
        notFound()
    }

    let lovedIds = new Set<string>();

    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user?.id && recipeData) {
        const { data: lovedRows } = await supabase
            .from("recipe_loves")
            .select("recipe_id")
            .eq("user_id", userData.user.id)
            .eq("recipe_id", recipeData.id)

        lovedIds = new Set(lovedRows?.map((row) => row.recipe_id));
    }

    const recipe = {
        ...recipeData,
        favs: recipeData.recipe_loves?.[0]?.count ?? 0,
        isFav: lovedIds.has(recipeData.id),
    }

    const profileData = recipe.profiles;

    const steps = JSON.parse(recipe.preparation_steps);
    const ingredients = JSON.parse(recipe.ingredients);

    const created_at = new Date(recipe.created_at!).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });


    return (
        <main className="flex min-h-screen flex-col relative">
            <div className="w-full h-[300px] bg-primary/10 relative overflow-hidden mt-20 md:mt-0">
                {recipe.cover_img && <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${recipe.cover_img}`}
                    alt="Recipe"
                    fill
                    className="object-cover w-full h-full"
                />}
            </div>
            <div className="mx-auto flex flex-col gap-4 mt-30 md:mt-10 px-5 md:px-20 absolute top-30 lg:top-40 w-full pb-20 md:pb-10">

                <Card className="px-5 py-6 relative h-fit w-full gap-2 rounded-sm ring-0 shadow">
                    <CardHeader className="">
                        <div className="flex justify-between">
                            <CardTitle className="text-primary-text font-semibold text-xl">{recipe.title}</CardTitle>
                            <FavBtn recipe={recipe} />
                        </div>
                        <div className="text-xs flex items-center gap-2 mt-2">
                            <Link href={`/users/@${profileData.username}`} >
                                <Image src={profileData.avatar ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${profileData?.avatar}` : "/avatar.png"} width={30} height={30} alt="Chef hat" className="h-8 w-8 rounded-full" />
                            </Link>
                            <div className="flex gap-1">
                                <Link href={`/users/@${profileData.username}`} className='font-semibold text-secondary-text underline'>By {profileData.name}, </Link>
                                <span className='font-semibold text-secondary-text/80'> On {created_at}</span>
                            </div>
                        </div>
                        <div className="flex gap-1 pt-2">
                            {recipe.tags.split(',').map((tag: any) => (
                                <Badge key={tag} variant="default" className='bg-primary/20 text-primary capitalize'>{tag.trim()}</Badge>
                            ))}
                        </div>
                    </CardHeader>


                    <CardContent className='flex flex-col py-2'>
                        <p className="text-secondary-text text-base leading-7">
                            {recipe.description}
                        </p>
                    </CardContent>
                </Card>

                <Card className='bg-primary/10 rounded-sm border-none ring-0 py-8 my-4'>
                    <CardContent className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5'>
                        <TimeCard
                            icon={<Timer size={25} className='text-primary' />}
                            title="Prep Time"
                            value={minsToText(Number(recipe.preparation_time))}
                        />
                        <TimeCard
                            icon={<CookingPot size={25} className='text-primary' />}
                            title="Cook Time"
                            value={minsToText(Number(recipe.cooking_time))}
                        />
                        <TimeCard
                            icon={<Users size={25} className='text-primary' />}
                            title="Servings"
                            value={`${recipe.servings} People`}
                        />
                        <TimeCard
                            icon={<Puzzle size={25} className='text-primary' />}
                            title="Difficulty"
                            value={recipe.difficulty}
                        />
                        <TimeCard
                            icon={<Earth size={25} className='text-primary' />}
                            title="Cuisine"
                            value={recipe.cuisine}
                        />

                        <TimeCard
                            className='lg:hidden'
                            icon={<Layers size={25} className='text-primary' />}
                            title="Steps"
                            value={`${steps.length} Steps`}
                        />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 ">
                    {steps.length > 0 && (
                        <Card className="order-2 lg:order-1 lg:col-span-3 rounded-sm ring-0 shadow p-3">
                            <CardHeader className='pt-2 pb-3'>
                                <CardTitle className='flex gap-2 text-xl text-primary'><HandPlatter /> Preparations</CardTitle>
                            </CardHeader>
                            <CardContent className='flex flex-col gap-2 pb-4'>
                                {steps?.map((stp: any) => (
                                    <PreparatonStep
                                        key={stp.id}
                                        step={stp.stepNumber.toString().length < 2 ? `0${stp.stepNumber}` : stp.stepNumber}
                                        title={stp.title}
                                        description={stp.description} />
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {ingredients.length > 0 && (
                        <Card className='order-1 lg:order-2 lg:col-span-2 rounded-sm ring-0 shadow p-3'>
                            <CardHeader className='pt-2 pb-3'>
                                <CardTitle className='flex gap-2 text-xl text-primary'><Sailboat /> Ingredients</CardTitle>
                            </CardHeader>
                            <CardContent className='flex flex-col gap-2 pb-4'>
                                {ingredients.map((ing: any) => (
                                    <IngredientStep
                                        key={ing.id}
                                        name={ing.name}
                                        quantity={ing.quantity}
                                        unit={ing.unit}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AskAI recipe={recipe} />
        </main>
    )
}

export default Page