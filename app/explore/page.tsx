"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RecipeCard from '@/components/RecipeCard'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import { RecipeType } from '@/types/recipe'
import { Clock, Loader2, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'

type UserResult = {
    id: string
    name: string
    username: string
    avatar: string | null
    bio?: string | null
}

export const COOKING_TIME_OPTIONS = [
    { label: 'Quick (Under 30 min)', min: 0, max: 29 },
    { label: 'Medium (30-60 min)', min: 30, max: 60 },
    { label: 'Long (1-2 hours)', min: 61, max: 120 },
    { label: 'Very Long (Over 2 hours)', min: 121, max: null },
]

const PAGE_SIZE = 12;

const Page = () => {
    const [searchType, setSearchType] = useState<'recipe' | 'user'>('recipe')
    const [searchKeyword, setSearchKeyword] = useState('')
    const [cuisine, setCuisine] = useState('')
    const [difficulty, setDifficulty] = useState('')
    const [cookingTime, setCookingTime] = useState('')

    const [recipes, setRecipes] = useState<RecipeType[]>([])
    const [users, setUsers] = useState<UserResult[]>([])
    const [isLoading, setIsLoading] = useState(false)      // fresh search / initial load
    const [isLoadingMore, setIsLoadingMore] = useState(false) // scroll-triggered load
    const [searchError, setSearchError] = useState('')

    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const [showFilter, setShowFilter] = useState(false)

    const { q, defineQ } = useAuth()
    const supabase = getSupabaseBrowserClient()
    const sentinelRef = useRef<HTMLDivElement>(null)
    
    // fetchRecipes + handleSearch  duplicate query
    const runSearch = useCallback(async (pageNum: number, append: boolean) => {
        const keyword = q ? q.trim().replaceAll(',', ' ') : searchKeyword.trim().replaceAll(',', ' ')
        const from = pageNum * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        if (append) setIsLoadingMore(true)
        else { setIsLoading(true); setSearchError('') }

        try {
            if (searchType === 'recipe') {
                let query = supabase
                    .from('recipes')
                    .select(`*, profiles (username,name,avatar), recipe_loves(count)`)
                    .order('created_at', { ascending: false })
                    .range(from, to)

                if (keyword) query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,tags.ilike.%${keyword}%`)
                if (cuisine.trim()) query = query.ilike('cuisine', `%${cuisine.trim()}%`)
                if (difficulty) query = query.eq('difficulty', difficulty)
                if (cookingTime) {
                    console.log(cookingTime)
                    const range = COOKING_TIME_OPTIONS.find((opt) => opt.label === cookingTime)
                    console.log(range);

                    if (range) {
                        query = query.gte('cooking_time', range.min)
                        if (range.max !== null) query = query.lte('cooking_time', range.max)
                    }
                }

                const { data: recipesRaw, error } = await query
                if (error) throw new Error(error.message)

                const { data: viewerData } = await supabase.auth.getUser();
                let lovedIds = new Set<string>();

                const viewer = viewerData?.user;

                if (viewer && recipesRaw?.length) {
                    const { data: lovedRows } = await supabase
                        .from("recipe_loves")
                        .select("recipe_id")
                        .eq("user_id", viewer.id)
                        .in(
                            "recipe_id",
                            recipesRaw.map((r: any) => r.id),
                        );

                    lovedIds = new Set(lovedRows?.map((row: any) => row.recipe_id));
                }

                const newRecipes = recipesRaw?.map(({ recipe_loves, ...recipe }: any) => ({
                    ...recipe,
                    favs: recipe_loves?.[0]?.count ?? 0,
                    isFav: lovedIds.has(recipe.id),
                }));
                setRecipes(prev => append ? [...prev, ...newRecipes] : newRecipes)
                setHasMore(newRecipes.length === PAGE_SIZE)
            } else {
                let query = supabase
                    .from('profiles')
                    .select('id,name,username,avatar,bio')
                    .range(from, to)

                if (keyword) query = query.or(`name.ilike.%${keyword}%,username.ilike.%${keyword}%`)

                const { data, error } = await query
                if (error) throw new Error(error.message)

                const newUsers = (data || []) as UserResult[]
                setUsers(prev => append ? [...prev, ...newUsers] : newUsers)
                setHasMore(newUsers.length === PAGE_SIZE)
            }
            setPage(pageNum)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Search failed'
            if (append) toast.error(message)
            else setSearchError(message)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [q, searchKeyword, searchType, cuisine, difficulty, cookingTime, supabase])

    // new search/filter means fresh start from page 0
    const handleSearch = useCallback(() => {
        setRecipes([])
        setUsers([])
        setHasMore(true)
        runSearch(0, false)
    }, [runSearch])

    useEffect(() => {
        handleSearch()
    }, [])

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') handleSearch()
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [handleSearch])

    useEffect(() => {
        if (q) {
            setSearchKeyword(q)
            handleSearch()
            defineQ('')
        }
    }, [])

    // infinite scroll observer
    useEffect(() => {
        if (!hasMore || isLoading) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoadingMore) {
                    runSearch(page + 1, true)
                }
            },
            { threshold: 0.1 }
        )

        if (sentinelRef.current) observer.observe(sentinelRef.current)
        return () => observer.disconnect()
    }, [hasMore, isLoading, isLoadingMore, page, runSearch])

    return (
        <div className="flex flex-col pt-15 md:pt-0 pb-20 md:pb-10 px-5 md:px-10">
            <div className="mt-3 mb-3">
                <h2 className="text-2xl font-bold text-primary-text">Find recipes and cooks</h2>
                <p className="mt-1 max-w-2xl text-sm text-secondary-text">
                    Search across recipes and users, then narrow the feed by cuisine and difficulty.
                </p>
            </div>

            <div className="flex items-center w-full">
                <div className="flex border border-secondary-text/10 rounded-md rounded-r-none border-r-0 my-2 w-full">
                    <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className='pl-4 h-11 rounded-none border-0 focus-visible:ring-0' placeholder="Search recipes and users" />
                    <div className="relative">
                        <select
                            id="search-type-filter"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as 'recipe' | 'user')}
                            className="h-11 w-18 sm:w-26 border-r border-secondary-text/10 rounded-none bg-background sm:px-3 sm:pr-10 text-sm text-primary-text "
                        >
                            <option value="recipe">Recipe</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>
                <Button className="h-12 rounded-none px-5 md:px-10 rounded-r-md border order-primary" onClick={handleSearch} disabled={isLoading || searchKeyword.length < 2}>
                    {isLoading ? 'Searching...' : 'Search'}
                </Button>
            </div>

            <div className="flex justify-between items-center my-1 px-1">
                <p className="">
                    <span className='font-semibold text-primary-text'>Filters: </span>
                    {cuisine || difficulty || cookingTime ? <></> : <span className='text-sm text-secondary-text'>No filters applied</span>}
                    {difficulty && <span className='ml-1 capitalize text-sm'>{difficulty},</span>}
                    {cuisine && <span className='ml-1 capitalize text-sm'>{cuisine},</span>}
                    {cookingTime && <span className='ml-1 capitalize text-sm'>{cookingTime}</span>}
                </p>
                <p className="text-primary-text font-semibold underline cursor-pointer" onClick={() => setShowFilter(!showFilter)}> Add Filter</p>
            </div>

            <section className={` rounded-md border border-secondary-text/10 bg-white p-4 shadow-sm md:p-5 ${showFilter ? 'block' : 'hidden'}`}>

                <div className="flex items-center justify-between">
                    <p className='text-secondary-text font-normal mb-3'>Add Filter</p>
                    <Button onClick={() => setShowFilter(!showFilter)} className='cursor-pointer'>Apply</Button>
                </div>

                <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${searchType === 'user' ? 'hidden' : ''}`}>
                    <div className="space-y-2">
                        <Input className='h-11' placeholder='Cuisine' value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <select
                                id="difficulty-filter"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="h-11 w-full appearance-none rounded-md border border-border/80 bg-background px-3 pr-10 text-sm text-primary-text outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Any difficulty</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <SlidersHorizontal size={18} className="hidden md:block pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <select
                                id="cooking-time-filter"
                                value={cookingTime}
                                onChange={(e) => setCookingTime(e.target.value)}
                                className="h-11 w-full appearance-none rounded-md border border-border/80 bg-background px-3 pr-10 text-sm text-primary-text outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Any cooking time</option>
                                {COOKING_TIME_OPTIONS.map((opt) => (
                                    <option key={opt.label} value={opt.label}>{opt.label}</option>
                                ))}
                            </select>
                            <Clock size={18} className="hidden md:block pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                        </div>
                    </div>

                </div>

            </section>

            {searchError && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {searchError}
                </p>
            )}

            {searchType === 'recipe' && recipes.length > 0 && (
                <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} isEdit={false} />
                    ))}
                </section>
            )}

            {searchType === 'user' && users.length > 0 && (
                <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {users.map((user) => (
                        <Link key={user.id} href={`/users/@${user.username}`} className="flex items-center gap-4 rounded-md border border-secondary-text/10 bg-white p-4 shadow-sm transition-colors hover:bg-surface/50">
                            <Image
                                src={user.avatar ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${user.avatar}` : "/avatar.png"}
                                width={56} height={56} alt={user.name}
                                className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30"
                            />
                            <div className="min-w-0">
                                <h3 className="truncate font-semibold text-primary-text">{user.name}</h3>
                                <p className="truncate text-sm text-secondary-text">@{user.username}</p>
                                {user.bio && <p className="mt-1 line-clamp-2 text-xs text-secondary-text">{user.bio}</p>}
                            </div>
                        </Link>
                    ))}
                </section>
            )}

            {!isLoading && !searchError && searchKeyword && searchType === 'recipe' && recipes.length === 0 && (
                <div className="flex h-[200px] w-full items-center justify-center pt-10">
                    <p className="text-secondary-text/80">No recipes found!</p>
                </div>
            )}

            {!isLoading && !searchError && searchKeyword && searchType === 'user' && users.length === 0 && (
                <div className="flex h-[200px] w-full items-center justify-center pt-10">
                    <p className="text-secondary-text/80">No users found!</p>
                </div>
            )}

            {isLoading && (
                <div className="flex h-[200px] w-full items-center justify-center pt-10">
                    <Loader2 className='w-8 h-8 animate-spin text-secondary-text' />
                </div>
            )}

            {/* scroll sentinel: list er nicher dike pohole next page load hobe */}
            {hasMore && !isLoading && (recipes.length > 0 || users.length > 0) && (
                <div ref={sentinelRef} style={{ height: 1 }} />
            )}

            {isLoadingMore && (
                <div className="flex justify-center py-6">
                    <Loader2 className='w-6 h-6 animate-spin text-secondary-text' />
                </div>
            )}
        </div>
    )
}

export default Page