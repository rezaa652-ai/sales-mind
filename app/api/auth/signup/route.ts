import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, { auth: { persistSession: false } });
}

async function readSignupPayload(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await req.json().catch(() => ({}));
    return {
      email: String(j.email || "").trim(),
      password: String(j.password || "").trim(),
      name: String(j.name || j.fullName || "").trim(),
    };
  }
  if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
    const f = await req.formData();
    return {
      email: String(f.get("email") || "").trim(),
      password: String(f.get("password") || "").trim(),
      name: String(f.get("name") || f.get("fullName") || "").trim(),
    };
  }
  throw new Error("unsupported_content_type");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await readSignupPayload(req);
    if (!email || !password) {
      return NextResponse.json({ error: "missing_email_or_password" }, { status: 400 });
    }

    const sb = makeSupabaseServer();
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const emailRedirectTo = origin ? `${origin}/auth/callback` : undefined;

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined,
        emailRedirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ✅ Return consistent property name
    return NextResponse.json({ success: true, user: data.user }, { status: 200 });
  } catch (e: any) {
    if (e?.message === "unsupported_content_type") {
      return NextResponse.json(
        { error: "Content-Type must be application/json or multipart/form-data" },
        { status: 415 }
      );
    }
    return NextResponse.json({ error: e?.message || "signup_failed" }, { status: 500 });
  }
}
