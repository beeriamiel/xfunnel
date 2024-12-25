import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = request.cookies.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: any) {
          request.cookies.set(name, value);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        async remove(name: string, options: any) {
          request.cookies.delete(name);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  const { error } = await supabase.auth.getUser();

  // Add your protected routes here
  if (request.nextUrl.pathname.startsWith("/protected") && error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
};
