import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const res = NextResponse.json({});
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options as CookieOptions)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json({
    ok: !!data.user,
    user: data.user ?? null,
    error: error?.message ?? null,
    cookies: req.cookies.getAll().map((c) => c.name),
  });
}
