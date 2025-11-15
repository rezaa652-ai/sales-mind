import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(req: NextRequest, path: string) {
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
            const opts: CookieOptions = {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: true,
              domain: ".salesmind.app", // ✅ allows www + root
              path: "/",
            };
            console.log("🍪 Setting cookie:", name, opts);
            res.cookies.set(name, value, opts);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  console.log("🔐 Login attempt started...");
  const res = NextResponse.redirect(redirectTo(req, "/app/qa"), 303);

  try {
    const { email, password } = await req.json();
    console.log("📧 Email received:", email);

    if (!email || !password)
      return NextResponse.json({ error: "missing_credentials" }, { status: 400 });

    const supabase = createClient(req, res);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.log("✅ Login success, redirecting...");
    return res;
  } catch (e: any) {
    console.error("💥 Login route failed:", e.message);
    return NextResponse.json({ error: e?.message || "login_failed" }, { status: 400 });
  }
}
