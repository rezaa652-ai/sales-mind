import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Always redirect and set cookies for the same host (www.salesmind.app)
function sameOrigin(req: NextRequest, path: string) {
  const host = req.headers.get("host") || "www.salesmind.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}${path}`;
}

function createClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: true,
              domain: "www.salesmind.app", // ✅ force single origin
              path: "/",
            } as CookieOptions);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(sameOrigin(req, "/app/qa"), 303);
  try {
    const { email, password } = await req.json();
    const supabase = createClient(req, res);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 401 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "login_failed" }, { status: 400 });
  }
}
