import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const errorDescription = searchParams.get("error_description");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const message =
    errorDescription ?? "Invalid or expired link, please try again";

  return NextResponse.redirect(
    `${origin}/forgot-password?message=${encodeURIComponent(message)}`,
  );
}

// http://localhost:3000/auth/confirm?code={code}&next=%2Fupdate-password

// http://localhost:3000/auth/confirm?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired&next=%2Fupdate-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired&sb=
