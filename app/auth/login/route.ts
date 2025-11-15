import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(req: NextRequest, path: string) {
  const u = new URL(req.url);
  u.hostname = "salesmind.app"; // ✅ Force main domain
  u.pathname = path;
  u.search = "";
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
            const secure =
              process.env.NODE_ENV === "production" ||
              process.env.VERCEL === "1";
            res.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure,
              domain: ".salesmind.app", // ✅ apply cookie to all subdomains
              path: "/",
            } as CookieOptions);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(redirectTo(req, "/app/qa"), 303);
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "missing_credentials" }, { status: 400 });

    const supabase = createClient(req, res);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 401 });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "login_failed" }, { status: 400 });
  }
}
