import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "missing email or password" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  const origin = new URL(req.url).origin;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // If "Email confirmations" are ON in Supabase, a confirm link will be sent.
    // After clicking it, Supabase will redirect to your callback (below).
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If confirmations are OFF, user is already signed in and cookies are set.
  // If confirmations are ON, tell the client to check their inbox.
  const needsEmailConfirm = !!data.user && !data.session;
  return NextResponse.json({
    ok: true,
    needsEmailConfirm,
    message: needsEmailConfirm ? "Check your email to confirm your account." : "Signed up.",
  });
}
