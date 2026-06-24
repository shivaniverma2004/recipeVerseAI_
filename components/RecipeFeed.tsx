"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import RecipeCard from "@/components/RecipeCard";
import { getFeedRecipes } from "@/lib/actions/recipe";
import { RecipeType } from "@/types/recipe";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const PAGE_SIZE = 12;

export default function RecipeFeed({ initialRecipes }: { initialRecipes: RecipeType[] }) {
    const [recipes, setRecipes] = useState<RecipeType[]>(initialRecipes);
    const [page, setPage] = useState(0); // page 0  already loaded from server
    const [hasMore, setHasMore] = useState(initialRecipes.length === PAGE_SIZE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const supabase = getSupabaseBrowserClient()
    const router = useRouter();
    
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user?.id) {
                toast.error("You are not logged in!");
                router.replace('/explore');
            }
        });
    }, [router, supabase]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        try {
            const nextPage = page + 1;
            const newRecipes = await getFeedRecipes(nextPage);
            setRecipes((prev) => [...prev, ...newRecipes]);
            setHasMore(newRecipes.length === PAGE_SIZE);
            setPage(nextPage);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load more recipes");
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, hasMore, isLoadingMore]);

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadMore();
            },
            { threshold: 0.1 }
        );

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    if (recipes.length === 0) {
        return (
            <div className="flex h-[200px] w-full items-center justify-center pt-30">
                <p className="text-secondary-text/80">Nothing here to show yet!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} isEdit={false} />
                ))}
            </div>

            {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

            {isLoadingMore && (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-secondary-text" />
                </div>
            )}
        </>
    );
}