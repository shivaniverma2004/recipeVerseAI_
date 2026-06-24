"use client";

import { Heart } from 'lucide-react'
import { RecipeType } from '@/types/recipe'
import { useState } from 'react'
import { toast } from 'react-toastify';
import { addFav, removeFav } from '@/lib/actions/recipe-fav';
import { useAuth } from '@/context/AuthContext';

const FavBtn = ({ recipe }: { recipe: RecipeType }) => {
    const [favs, setFavs] = useState<number>(recipe.favs!);
    const [isFav, setIsFav] = useState<boolean>(recipe.isFav!);
    const { isAuth } = useAuth();

    const handleFav = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuth) return toast.error("You are not logged in to perform this action");
        setIsFav(!isFav)
        setFavs(isFav ? favs - 1 : favs + 1)
        try {
            if (isFav) {
                await removeFav(recipe.id!)
            } else {
                await addFav(recipe.id!)
            }
        } catch (error: any) {
            setIsFav(isFav)
            setFavs(favs);
            toast.error(error.message)
        }
    }

    return (
        <div onClick={handleFav} className="flex items-center gap-1.5 text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full cursor-pointer">
            {isFav ? <Heart className="h-3.5 w-3.5 fill-rose-500 cursor-pointer" /> : <Heart className="h-3.5 w-3.5 cursor-pointer" />}
            <span className="text-xs">{favs}</span>
        </div>
    )
}

export default FavBtn