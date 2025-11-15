import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


// ✅ Always redirect to the canonical www domain
const PROD_ORIGIN = "https://www.salesmind.app";


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
  const redirectUrl = `${PROD_ORIGIN}/app/qa`; // 🔒 force to www.salesmind.app/app/qa
  const res = NextResponse.redirect(redirectUrl, 303);


  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "missing_credentials" }, { status: 400 });


    const supabase = makeClient(req, res);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });


    return res; // ✅ safe redirect, same origin
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "bad_request" }, { status: 400 });
  }
}
