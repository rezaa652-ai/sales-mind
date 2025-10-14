// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  // Public bypass for the electricity API
  if (pathname.startsWith("/api/geo/electricity")) {
    return NextResponse.next();
  }

  // Always create a mutable response we can write cookies onto
  const res = NextResponse.next();

  // Supabase client with Next 15 cookie bridge (getAll / setAll)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            // Cast because NextResponse expects Next's CookieOptions
            res.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );

  // Touch auth so refreshed tokens (if any) get written via setAll -> res
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*", "/api/:path*"],
};
