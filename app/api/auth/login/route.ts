import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createClient(req: NextRequest, res: NextResponse) {
  const host = req.headers.get("host") || "salesmind.app";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

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
              secure: !isLocal ? true : false,
              domain: isLocal ? undefined : "salesmind.app",
              path: "/",
            } as CookieOptions);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  console.log("📩 Incoming login request");
  const res = NextResponse.json({ success: false });

  try {
    const { email, password } = await req.json();
    const supabase = createClient(req, res);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Supabase login error:", error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.log("✅ Login success for:", data.user.email);

    // ✅ Return success with cookies attached
    return new NextResponse(
      JSON.stringify({ success: true, redirect: "/app/qa" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...Object.fromEntries(res.headers),
        },
      }
    );
  } catch (e: any) {
    console.error("🔥 Login failed:", e);
    return NextResponse.json(
      { error: e.message || "server_failed" },
      { status: 500 }
    );
  }
}
