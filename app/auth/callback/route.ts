import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const errorDesc = searchParams.get("error_description");

  if (errorDesc) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorDesc)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  // We’ll write cookies onto the redirect response
  const res = NextResponse.redirect(`${origin}/app/qa`);

  // Next 15: get the cookie store and pass it directly
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`);
  }

  return res;
}
