"use server";

import { createSupabaseServerClient } from "../supabase/server-client";

// this funciton is not using
export const getRecipeFavs = async (recipeId: string) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("recipe_loves")
    .select("*")
    .eq("recipe_id", recipeId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// this funciton is not using
export const isFavRecipe = async (recipeId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (authError || !userId) {
    return false;
  }

  const { data, error } = await supabase
    .from("recipe_loves")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
};

export const addFav = async (recipeId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    throw new Error("You are not logged in!");
  }

  const { error } = await supabase
    .from("recipe_loves")
    .insert({ recipe_id: recipeId, user_id: userId });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};

export const removeFav = async (recipeId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    throw new Error("You are not logged in!");
  }

  const { error } = await supabase
    .from("recipe_loves")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};
