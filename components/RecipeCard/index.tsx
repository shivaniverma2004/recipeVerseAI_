import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RecipeType } from '@/types/recipe'
import RecipeDeleteBtn from './RecipeDeleteBtn'
import FavBtn from './FavBtn'
import { minsToText } from '@/utils/mins-text'
import Author from './Author'
import { UserType } from '@/types/user'

const RecipeCard = ({ recipe, isEdit }: { recipe: RecipeType, isEdit?: boolean }) => {

    return (

        <Card key={recipe.id} className="bg-surface/50 hover:bg-surface/70 transition-colors pt-0 gap-2 group">
            <Link href={`/recipes/${recipe.id}`}>
                <CardHeader className="p-0 relative">
                    <div className="p-0 relative overflow-hidden h-48 bg-primary/10">
                        {recipe.cover_img && <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${recipe.cover_img}`}
                            alt={recipe.title}
                            width={500}
                            height={300}
                            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />}
                    </div>
                    <div className="px-5 py-3">
                        <p className='text-primary capitalize'>{recipe.cuisine}</p>
                        <CardTitle className="text-lg font-semibold text-primary-text">{recipe.title}</CardTitle>
                        <Author user={recipe.profiles as UserType} />
                    </div>


                    <Badge className="absolute top-4 right-4 capitalize">{recipe.difficulty}</Badge>
                </CardHeader>
                <CardContent className="px-5 mt-auto">
                    <div className="flex items-center justify-between text-secondary-text">
                        <div className="flex items-center justify-center gap-1.5 font-semibold">
                            <span className="text-base">
                                <Timer className="h-4 w-4 text-primary" />
                            </span>
                            <span className="pt-0.5 text-xs">{minsToText(Number(recipe.preparation_time) + Number(recipe.cooking_time))}</span>
                        </div>
                        <FavBtn recipe={recipe} />
                    </div>
                </CardContent>
            </Link >
            {isEdit && (
                <CardFooter className="px-5 pb-5 pt-0 border-none flex gap-1">
                    <Button size="lg" variant="default" asChild className="flex-1 border">
                        <Link href={`/profile/recipes/edit/${recipe.id}`}>
                            Edit Recipe
                        </Link>
                    </Button>
                    <RecipeDeleteBtn id={recipe.id!} />
                </CardFooter>
            )}
        </Card>
    )
}

export default RecipeCard