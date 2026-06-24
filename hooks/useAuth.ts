"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth as useAuthContext } from "@/context/AuthContext";

type Inputs = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const useAuth = () => {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { setAuth, isAuth } = useAuthContext();

  useEffect(() => {
    if (isAuth) router.push("/");
  }, [isAuth]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<Inputs>();

  const onSignUpSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const check = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .maybeSingle();

    if (check.data) {
      setError("username", {
        message: "Username already taken",
        type: "manual",
      });
      setLoading(false);
      return;
    }

    if (data.password.length < 8) {
      setError("password", {
        message: "Password must be at least 8 characters long",
        type: "manual",
      });
      setLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        message: "Passwords do not match",
        type: "manual",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: {
          name: data.name,
          username: data.username,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      router.push("/login");
      toast.success("Account created successfully");
    }
    setLoading(false);
  };

  const onLoginSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const { error, data: d } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setAuth(d.session);
      router.push("/profile");
      toast.success("Logged in successfully");
    }
    setLoading(false);
  };

  return {
    register,
    errors,
    loading,
    handleSubmit,
    onSignUpSubmit,
    onLoginSubmit,
  };
};

export default useAuth;
