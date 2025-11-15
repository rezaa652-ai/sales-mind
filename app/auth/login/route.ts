import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildRedirect(req: NextRequest, path: string) {
  const u = new URL(req.url);
  u.pathname = path;
  u.search = "";
  u.hash = "";
  return u.toString();
}

function createClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(buildRedirect(req, "/app/qa"), 303);
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "missing_credentials" }, { status: 400 });

    const supabase = createClient(req, res);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });

    // Cookies are set on `res`; redirect continues with them attached
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "login_failed" }, { status: 400 });
  }
}
