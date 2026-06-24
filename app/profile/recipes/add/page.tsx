"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    CookingPot,
    HandPlatter,
    Timer,
    Upload,
    Image as ImageIcon,
    Tag,
    BookOpen,
    ListOrdered,
    Loader2
} from 'lucide-react';
import Ingredients from '@/components/recipe/Ingredients';
import PreparationSteps from '@/components/recipe/PreparationSteps';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import Image from 'next/image';
import { createRecipe } from '@/lib/actions/recipe';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Ingredient } from '@/components/recipe/Ingredients';
import type { PreparationStep } from '@/components/recipe/PreparationSteps';
import type { RecipeType } from '@/types/recipe';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DurationInputGroup from '@/components/DurationInputGroup';
import { useAuth } from '@/context/AuthContext';

const Page = () => {
    const [loading, setLoading] = useState(false);
    const [coverImg, setCoverImg] = useState<string | null>(null)
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [steps, setSteps] = useState<PreparationStep[]>([])
    const [coverFile, setCoverFile] = useState<File | null>(null)

    const { fetchUser } = useAuth();

    const router = useRouter();

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<RecipeType>();

    const handleCoverImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        // is the image PNG, JPEG, and WebP formats. and maximum upload size of 5 MB
        if (file) {
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                setError('cover_img', { message: 'Invalid file format. Only PNG, JPEG, and WebP formats are allowed.' })
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('cover_img', { message: 'Maximum upload size is 5 MB.' })
                return;
            }
            setCoverFile(file)
            setCoverImg(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (data: RecipeType) => {
        setLoading(true);
        try {
            await createRecipe(
                {
                    title: data.title,
                    description: data.description,
                    cover_img: coverFile ?? null,
                    ingredients: ingredients,
                    preparation_steps: steps,
                    preparation_time: data.preparation_time,
                    cooking_time: data.cooking_time,
                    servings: data.servings,
                    difficulty: data.difficulty?.toLowerCase(),
                    cuisine: data.cuisine?.toLowerCase(),
                    tags: data.tags?.toLowerCase()
                }
            )
            toast.success("Recipe created successfully!")
            fetchUser();
            router.push('/profile');
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen flex-col bg-muted/30 dark:bg-muted/10 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-4xl flex flex-col gap-6">

                <Card className="border border-border/60 rounded-2xl shadow-xl bg-card overflow-hidden transition-all duration-300 my-12 md:my-0">
                    <CardHeader className="border-b border-border/40 bg-muted/10 px-6 py-6">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <CookingPot className="h-6 w-6 animate-pulse" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                                    Add New Recipe
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                                    Share your culinary creation with the RecipeVerse community.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-6 py-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* Section: Recipe Basics */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-primary/95 flex items-center gap-2 border-b pb-2 border-border/40 uppercase tracking-wider">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Recipe Basics</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name" className="text-xs font-semibold text-foreground/80 tracking-wide">Recipe Title</Label>
                                        <Input
                                            id="name"
                                            className="h-10 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                            placeholder="e.g. Lemon Herb Roasted Chicken"
                                            {...register('title', { required: "Title is required" })}
                                        />
                                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="cuisine" className="text-xs font-semibold text-foreground/80 tracking-wide">Cuisine</Label>
                                        <Input
                                            id="cuisine"
                                            className="h-10 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                            placeholder="e.g. Italian, Mexican, Fusion"
                                            {...register('cuisine', { required: "Cuisine is required" })}
                                        />
                                        {errors.cuisine && <p className="text-xs text-red-500">{errors.cuisine.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="tags" className="text-xs font-semibold text-foreground/80 tracking-wide">Tags</Label>
                                        <div className="relative flex items-center">
                                            <Tag className="absolute left-3 h-4 w-4 text-muted-foreground/80" />
                                            <Input
                                                id="tags"
                                                className="h-10 pl-9 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                                placeholder="e.g. Dinner, Healthy, Quick"
                                                {...register('tags', { required: "Tags are required" })}
                                            />
                                        </div>
                                        {errors.tags && <p className="text-xs text-red-500">{errors.tags.message}</p>}
                                        <span className="text-[10px] text-muted-foreground/80">Separate tags with commas.</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="difficulty" className="text-xs font-semibold text-foreground/80 tracking-wide">Difficulty</Label>
                                        <Controller
                                            name="difficulty"
                                            control={control}
                                            rules={{
                                                required: "Difficulty is required",
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger className="w-full h-10 py-[18px]">
                                                        <SelectValue placeholder="Select Difficulty" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="easy">Easy</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="hard">Hard</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.difficulty && <p className="text-xs text-red-500">{errors.difficulty.message}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="description" className="text-xs font-semibold text-foreground/80 tracking-wide">Description / Recipe Story</Label>
                                    <Textarea
                                        id="description"
                                        className="min-h-[120px] bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary leading-relaxed resize-y"
                                        placeholder="Tell us what makes this recipe special, who inspired it, or any tips for the perfect cook..."
                                        {...register('description', { required: "Description is required" })}
                                    />
                                    {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                                </div>
                            </div>

                            {/* Section: Image & Timing */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-5">
                                    <h3 className="text-sm font-semibold text-primary/95 flex items-center gap-2 border-b pb-2 border-border/40 uppercase tracking-wider">
                                        <Timer className="h-4 w-4" />
                                        <span>Timing & Servings</span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="preparation_time" className="text-xs font-semibold text-foreground/80 tracking-wide">Prep Time</Label>
                                            <DurationInputGroup
                                                control={control}
                                                name="preparation_time"
                                                rules={{
                                                    validate: (value: any) =>
                                                        (value && value > 0) || "Prep time is required",
                                                }}
                                            />
                                            {errors.preparation_time && <p className="text-xs text-red-500">{errors.preparation_time.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="cooking_time" className="text-xs font-semibold text-foreground/80 tracking-wide">Cook Time</Label>
                                            <DurationInputGroup
                                                control={control}
                                                name="cooking_time"
                                                rules={{
                                                    validate: (value: any) =>
                                                        (value && value > 0) || "Cooking time is required",
                                                }}
                                            />
                                            {errors.cooking_time && <p className="text-xs text-red-500">{errors.cooking_time.message}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="servings" className="text-xs font-semibold text-foreground/80 tracking-wide">Servings</Label>
                                        <InputGroup className="h-10 bg-background border-border/80 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                            <InputGroupInput
                                                id="servings"
                                                type="number"
                                                placeholder="e.g. 4"
                                                {...register('servings', { required: "Servings is required" })}
                                            />
                                            <InputGroupAddon align="inline-end" className="pr-3">
                                                <InputGroupText className="text-xs font-medium text-muted-foreground/80">people</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {errors.servings && <p className="text-xs text-red-500">{errors.servings.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-5 flex flex-col">
                                    <h3 className="text-sm font-semibold text-primary/95 flex items-center gap-2 border-b pb-2 border-border/40 uppercase tracking-wider">
                                        <ImageIcon className="h-4 w-4" />
                                        <span>Recipe Cover</span>
                                    </h3>

                                    <div className="flex flex-col gap-2 flex-1 justify-end">
                                        <Label htmlFor="cover_img" className="text-xs font-semibold text-foreground/80 tracking-wide">Cover Image</Label>
                                        <Label htmlFor="cover_img" className="relative border-2 border-dashed border-border/60 hover:border-primary/50 rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-muted/5 hover:bg-muted/10 h-[116px] group">
                                            {coverImg && <Image
                                                src={coverImg}
                                                height={100}
                                                width={100}
                                                alt='Profile Pic'
                                                className=' absolute inset-0 h-full w-full z-10 object-cover rounded-xl'
                                            />}
                                            <Upload className="h-6 w-6 text-muted-foreground/60 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
                                            <div className="text-center">
                                                <span className="text-xs font-semibold text-primary group-hover:underline">Upload cover photo</span>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, or WEBP</p>
                                            </div>
                                            <Input id="cover_img" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCoverImg} />
                                        </Label>
                                    </div>
                                    {errors.cover_img && <p className="text-xs text-red-500">{errors.cover_img.message}</p>}
                                </div>
                            </div>

                            {/* Section: Ingredients */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-primary/95 flex items-center gap-2 border-b pb-2 border-border/40 uppercase tracking-wider">
                                    <HandPlatter className="h-4 w-4" />
                                    <span>Ingredients</span>
                                </h3>
                                <Ingredients ingredients={ingredients} setIngredients={setIngredients} />
                            </div>

                            {/* Section: Preparation Steps */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-primary/95 flex items-center gap-2 border-b pb-2 border-border/40 uppercase tracking-wider">
                                    <ListOrdered className="h-4 w-4" />
                                    <span>Preparation Steps</span>
                                </h3>
                                <PreparationSteps steps={steps} setSteps={setSteps} />
                            </div>

                            {/* Form Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border/40">
                                <Button onClick={() => router.back()} variant="outline" type="button" className="h-10 px-5 font-medium border-border/80 w-full sm:w-fit">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="h-10 px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:translate-y-px w-full sm:w-fit">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Publishing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CookingPot className="h-4 w-4" />
                                            <span>Publish Recipe</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default Page