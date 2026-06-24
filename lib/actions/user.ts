"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../supabase/server-client";

export const getByUsername = async (username: string) => {
  const supabase = await createSupabaseServerClient();
  const normalizedUsername = decodeURIComponent(username).replaceAll("@", "");

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalizedUsername)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id ?? null;

  const [followersRes, followingRes, isFollowingRes] = await Promise.all([
    // total followers: rows where this user is the one being followed
    supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id),

    // total following: rows where this user is the follower
    supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id),

    // is auth user following this profile?
    currentUserId
      ? supabase
          .from("user_follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const followersCount = followersRes.count ?? 0;
  const followingCount = followingRes.count ?? 0;
  const isFollowing = !!isFollowingRes.data;

  // recipe data
  const { data: recipesRaw, error: recipesError } = await supabase
    .from("recipes")
    .select(`*, profiles (username,name,avatar), recipe_loves(count)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (recipesError) {
    throw new Error(recipesError.message);
  }

  let lovedIds = new Set<string>();

  if (viewer && recipesRaw?.length) {
    const { data: lovedRows } = await supabase
      .from("recipe_loves")
      .select("recipe_id")
      .eq("user_id", viewer.id)
      .in(
        "recipe_id",
        recipesRaw.map((r) => r.id),
      );

    lovedIds = new Set(lovedRows?.map((row) => row.recipe_id));
  }

  const recipes = recipesRaw?.map(({ recipe_loves, ...recipe }) => ({
    ...recipe,
    favs: recipe_loves?.[0]?.count ?? 0,
    isFav: lovedIds.has(recipe.id),
  }));

  return {
    user: {
      ...user,
      following: followingCount,
      followers: followersCount,
      isFollowing,
    },
    recipes,
    isMe: viewer?.id === user.id,
  };
};

export const getOwnProfile = async () => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (authError || !userId) {
    return redirect("/login");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const [followersRes, followingRes, recipesRes] = await Promise.all([
    // total followers: rows where this user is the one being followed
    supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),

    // total following: rows where this user is the follower
    supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),

    supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
  ]);

  const followersCount = followersRes.count ?? 0;
  const followingCount = followingRes.count ?? 0;
  const recipeCount = recipesRes.count ?? 0;

  // recipe data
  const { data: recipesRaw, error: recipesError } = await supabase
    .from("recipes")
    .select(`*, profiles (username,name,avatar), recipe_loves(count)`)
    .eq("user_id", data.id)
    .order("created_at", { ascending: false });

  if (recipesError) {
    throw new Error(recipesError.message);
  }

  let lovedIds = new Set<string>();

  if (recipesRaw?.length) {
    const { data: lovedRows } = await supabase
      .from("recipe_loves")
      .select("recipe_id")
      .eq("user_id", userId)
      .in(
        "recipe_id",
        recipesRaw.map((r) => r.id),
      );

    lovedIds = new Set(lovedRows?.map((row) => row.recipe_id));
  }

  const recipes = recipesRaw?.map(({ recipe_loves, ...recipe }) => ({
    ...recipe,
    favs: recipe_loves?.[0]?.count ?? 0,
    isFav: lovedIds.has(recipe.id),
  }));

  return {
    user: { ...data, following: followingCount, followers: followersCount, recipes: recipeCount },
    recipes,
  };
};

export const addFollow = async (followingId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const followerId = data.user?.id;

  if (authError || !followerId) {
    throw new Error("You are not logged in!");
  }

  if (followerId === followingId) {
    throw new Error("You cannot follow yourself!");
  }

  const { error } = await supabase
    .from("user_follows")
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};

export const getFollowers = async (userId: string) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_follows")
    .select("*")
    .eq("following_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getFollowing = async (userId: string) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_follows")
    .select("*")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getRecipes = async (userId: string) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const isFollowingUser = async (followingId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const followerId = data.user?.id;

  if (authError || !followerId) {
    return false;
  }

  const { data: follow, error } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(follow);
};

export const unFollow = async (followingId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const followerId = data.user?.id;

  if (authError || !followerId) {
    throw new Error("You are not logged in!");
  }

  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};
