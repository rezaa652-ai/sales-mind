// app/auth/signout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeClient(req: NextRequest, res: NextResponse) {
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
  return { supabase, res };
}

export async function GET(req: NextRequest) {
  const res = NextResponse.next(); // start with a mutable response
  try {
    const { supabase } = makeClient(req, res);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Signout error:", error);
  } catch (e) {
    console.error("Unexpected signout error:", e);
  }
  // perform redirect *after* cookies have been safely cleared
  return NextResponse.redirect(new URL("/auth?mode=login", req.url), 303);
}

export const POST = GET;

