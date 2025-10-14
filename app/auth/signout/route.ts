// app/auth/signout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeClient(req: NextRequest) {
  // Prepare a redirect response FIRST so cookies can attach to it
  const res = NextResponse.redirect(new URL("/auth", req.url), 303);

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
            res.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );

  return { supabase, res };
}

async function doSignOut(req: NextRequest) {
  const { supabase, res } = makeClient(req);
  await supabase.auth.signOut(); // clears cookies internally
  return res; // redirect to /auth
}

export async function GET(req: NextRequest) {
  return doSignOut(req);
}

export async function POST(req: NextRequest) {
  return doSignOut(req);
}
