import { getFeedRecipes } from "@/lib/actions/recipe";
import RecipeFeed from "@/components/RecipeFeed";

export default async function Home() {
  const initialRecipes = await getFeedRecipes(0);

  return (
    <div className="flex flex-col pt-15 md:pt-0 pb-20 md:pb-10 px-5 md:px-10">
      <div className="mt-3 md:mt-1 mb-3">
        <h2 className="text-2xl font-bold text-primary-text">Recipe Feed</h2>
        <p className="mt-1 max-w-2xl text-sm text-secondary-text pb-3">
          Latest recipes from users you follow
        </p>
      </div>
      <RecipeFeed initialRecipes={initialRecipes} />
    </div>
  );
}