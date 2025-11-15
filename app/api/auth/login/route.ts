import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeClient(req: NextRequest, res: NextResponse) {
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
              domain: ".salesmind.app", // ✅ applies to both www and root
              path: "/",
            };
            console.log("🍪 Writing cookie:", name);
            res.cookies.set(name, value, opts);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  console.log("🔐 Login attempt started");
  const res = NextResponse.next(); // ✅ create a response we can modify first

  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "missing_credentials" }, { status: 400 });

    const supabase = makeClient(req, res);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.log("✅ Auth success, cookies set. Redirecting...");
    // ✅ Now redirect AFTER cookies written
    const redirectRes = NextResponse.redirect("https://www.salesmind.app/app/qa", 303);
    res.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie);
    });
    return redirectRes;
  } catch (e: any) {
    console.error("💥 Login route failed:", e.message);
    return NextResponse.json({ error: e?.message || "login_failed" }, { status: 400 });
  }
}
