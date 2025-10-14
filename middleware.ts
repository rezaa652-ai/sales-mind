// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  // Public API bypass (no auth HTML injected)
  if (pathname.startsWith("/api/geo/electricity")) {
    return NextResponse.next();
  }

  let res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, value, options) => res.cookies.set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );

  // Refresh tokens if needed and write back cookies
  await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*", "/api/:path*"],
};
