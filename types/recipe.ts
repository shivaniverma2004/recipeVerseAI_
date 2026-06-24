export type RecipeType = {
    id?: string;
    created_at?: string;
    title: string;
    description: string;
    cover_img: string;
    ingredients: string;
    preparation_steps: string;
    preparation_time: string;
    cooking_time: string;
    servings: string;
    difficulty: string;
    cuisine: string;
    tags: string;
    user_id: string;
    favs?: number;
    isFav?: boolean;
    profiles?: {
        id: string;
        name: string;
        username: string;
        avatar: string;
    }
}