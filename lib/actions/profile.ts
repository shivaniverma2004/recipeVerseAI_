"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").optional(),
  bio: z.string().trim().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    return { error: "You are not logged in!" };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, bio } = parsed.data;

  if (email && typeof email === "string" && email !== data.user?.email) {
    await supabase.auth.updateUser({ email });
  }

  const { data: user, error } = await supabase
    .from("profiles")
    .update({ name, email, bio })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { error: "Failed to update profile" };
  }

  revalidatePath("/");

  return { success: true, user };
}

const passwordSchema = z.object({
  current_password: z.string().trim().min(1, "Current password is required"),
  new_password: z.string().trim().min(1, "New password is required").max(100),
});

export async function updatePassword(
  current_password: string,
  new_password: string,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    throw new Error("You are not logged in!");
  }

  if (!current_password || !new_password) {
    throw new Error("Please provide current and new password!");
  }

  const parsed = passwordSchema.safeParse({
    current_password,
    new_password,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid password!");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.user?.email || "",
    password: current_password,
  });

  if (signInError) {
    throw new Error("Invalid current password!");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/profile/password");
  return { success: true };
}

export async function profileUpload(file: File) {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (authError || !userId) {
    throw new Error("You are not logged in!");
  }

  const fileName = `${Date.now()}-${file.name}`;

  const { data: result, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file);
  
  if (error) {
    throw new Error(error.message);
  }

  const { data: oldUser, error: getError } = await supabase
    .from("profiles")
    .select("avatar")
    .eq("id", userId)
    .single();

  if (getError) {
    throw new Error(getError.message);
  }

  if (oldUser?.avatar) {
    const path = oldUser.avatar.replace("avatars/", "");

    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([path]);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  const { data: user, error: updateError } = await supabase
    .from("profiles")
    .update({ avatar: result.fullPath })
    .eq("id", userId);

  if (updateError) {
    return { error: "Failed to update profile" };
  }

  return { success: true, result };
}
