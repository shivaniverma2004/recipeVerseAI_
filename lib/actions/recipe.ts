"use server";

import { Ingredient } from "@/components/recipe/Ingredients";
import type { PreparationStep } from "@/components/recipe/PreparationSteps";
import { createSupabaseServerClient } from "../supabase/server-client";

type Recipe = {
  title: string;
  description: string;
  cover_img: File | undefined | null;
  ingredients: Ingredient[];
  preparation_steps: PreparationStep[];
  preparation_time: string;
  cooking_time: string;
  servings: string;
  difficulty: string;
  cuisine: string;
  tags: string;
};

export async function getAllRecipes() {
  const supabase = await createSupabaseServerClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(`*,profiles (username,name,avatar)`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return recipes;
}

const PAGE_SIZE = 12;

export async function getFeedRecipes(page: number = 0) {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    return [];
  }

  const { data: follows, error: followError } = await supabase
    .from("user_follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (followError) throw followError;

  const followingIds = follows.map((f) => f.following_id);

  if (followingIds.length === 0) {
    return [];
  }

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: recipesRaw, error } = await supabase
    .from("recipes")
    .select(`*, profiles (username,name,avatar), recipe_loves(count)`)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  let lovedIds = new Set<string>();

  if (recipesRaw?.length) {
    const { data: lovedRows } = await supabase
      .from("recipe_loves")
      .select("recipe_id")
      .eq("user_id", userId)
      .in(
        "recipe_id",
        recipesRaw.map((r: any) => r.id),
      );

    lovedIds = new Set(lovedRows?.map((row: any) => row.recipe_id));
  }

  const recipes = recipesRaw?.map(({ recipe_loves, ...recipe }: any) => ({
    ...recipe,
    favs: recipe_loves?.[0]?.count ?? 0,
    isFav: lovedIds.has(recipe.id),
  }));

  return recipes ?? [];
}

export async function createRecipe({
  title,
  description,
  cover_img,
  ingredients,
  preparation_steps,
  preparation_time,
  cooking_time,
  servings,
  difficulty,
  cuisine,
  tags,
}: Recipe) {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    return { error: "You are not logged in!" };
  }

  let imgPath = null;

  // save image
  if (cover_img) {
    const fileName = `${Date.now()}-${cover_img.name}`;

    const { data: result, error: uploadError } = await supabase.storage
      .from("covers")
      .upload(fileName, cover_img);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    imgPath = result.fullPath;
  }

  // save data
  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      title,
      description,
      ingredients: JSON.stringify(ingredients),
      preparation_steps: JSON.stringify(preparation_steps),
      user_id: userId,
      preparation_time,
      cover_img: imgPath,
      cooking_time,
      servings,
      difficulty,
      cuisine,
      tags,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, recipe };
}

export const updateRecipe = async (
  id: string,
  {
    title,
    description,
    cover_img,
    ingredients,
    preparation_steps,
    preparation_time,
    cooking_time,
    servings,
    difficulty,
    cuisine,
    tags,
  }: Recipe,
) => {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  const { data: oldRecipe, error: fetchError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (authError || !userId || oldRecipe.user_id !== userId) {
    throw new Error("You are not logged in!");
  }

  let imgPath = oldRecipe.cover_img;

  // save image
  if (cover_img) {
    const fileName = `${Date.now()}-${cover_img.name}`;

    const { data: result, error: uploadError } = await supabase.storage
      .from("covers")
      .upload(fileName, cover_img);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    imgPath = result.fullPath;

    // delete old image
    if (oldRecipe.cover_img) {
      const path = oldRecipe.cover_img.replace("covers/", "");
      const { error: deleteError } = await supabase.storage
        .from("covers")
        .remove([path]);
      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }
  }

  const { error } = await supabase
    .from("recipes")
    .update({
      title,
      description,
      ingredients: JSON.stringify(ingredients),
      preparation_steps: JSON.stringify(preparation_steps),
      user_id: userId,
      preparation_time,
      cover_img: imgPath,
      cooking_time,
      servings,
      difficulty,
      cuisine,
      tags,
    })
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};

export const deleteRecipe = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  const { data: recipe, error: fetchError } = await supabase
    .from("recipes")
    .select("user_id, cover_img")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (authError || !userId || recipe.user_id !== userId) {
    throw new Error("You are not authorized to delete this recipe!");
  }

  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (recipe.cover_img) {
    const path = recipe.cover_img.replace("covers/", "");

    const { error: deleteError } = await supabase.storage
      .from("covers")
      .remove([path]);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  return { success: true };
};
