// app/api/auth/sync/route.ts
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
  const res = NextResponse.json({ ok: true });
  try {
    const { access_token, refresh_token } = await req.json();
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "missing tokens" }, { status: 400 });
    }
    const supabase = makeClient(req, res);
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "bad request" }, { status: 400 });
  }
}
