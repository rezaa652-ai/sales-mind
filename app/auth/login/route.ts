import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Build an absolute URL on the current origin (works on local & prod www.salesmind.app) */
function urlOnSameOrigin(req: NextRequest, pathname: string) {
  const u = new URL(req.url);
  u.pathname = pathname;
  u.search = "";
  u.hash = "";
  return u.toString();
}

function makeClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            // Forward Supabase Auth cookies onto our redirect response
            res.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  // IMPORTANT: set the redirect response up-front so cookies can attach to it.
  const res = NextResponse.redirect(urlOnSameOrigin(req, "/app/qa"), 303);
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
    }
    const supabase = makeClient(req, res);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    // Cookies are on 'res' now; the 303 ensures the browser re-requests /app/qa with fresh cookies.
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "bad_request" }, { status: 400 });
  }
}
