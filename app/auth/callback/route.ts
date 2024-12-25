import { createClient } from '@/app/supabase/server'
import { NextResponse } from "next/server";
import { Database } from "@/types/supabase";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;
    const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

    // Handle missing code parameter
    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=missing_code`);
    }

    const supabase = await createClient();

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error("Auth callback error:", exchangeError);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    // Verify session exists
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User error:', userError);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    // Handle successful auth
    if (redirectTo) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    return NextResponse.redirect(`${origin}/protected`);
  } catch (error) {
    console.error("Unexpected auth callback error:", error);
    return NextResponse.redirect(`${origin}/login?error=unexpected`);
  }
}
