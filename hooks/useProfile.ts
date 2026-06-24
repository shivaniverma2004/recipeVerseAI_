"use client";

import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/actions/profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Inputs = {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: File;
};

const useProfile = () => {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("bio", data.bio);
    // formData.append("avatar", data.avatar);

    try {
      await updateProfile(formData);
      updateUser();
      toast.success("Profile updated successfully!");
      router.back();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) {
        toast.error("You are not logged in!");
        router.push("/");
        return;
      }

      const user = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!user.success) {
        toast.error("Profile is not found");
        router.push("/");
        return;
      }
      reset({ ...user.data as any, email: data.user?.email });
    };
    fetchUser();
  }, []);

  return {
    register,
    loading,
    handleSubmit,
    errors,
    onSubmit,
  };
};

export default useProfile;
