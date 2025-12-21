/* eslint-disable @typescript-eslint/no-explicit-any */
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
            res.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  try {
    const supabase = makeClient(req, res);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const id = String(body.id || "").trim();
    const file_path = String(body.file_path || "").trim();
    const filename = String(body.filename || "").trim();
    const mime_type = body.mime_type ? String(body.mime_type) : null;
    const size_bytes =
      body.size_bytes === 0 || body.size_bytes ? Number(body.size_bytes) : null;

    if (!id || !file_path || !filename) {
      return NextResponse.json(
        { error: "missing_fields", detail: "id, file_path, filename required" },
        { status: 400 }
      );
    }

    // Insert DB row (must match your schema columns)
    const { error: dbErr } = await supabase.from("calls").insert({
      id,
      owner: user.id,
      filename,
      file_path,
      mime_type,
      size_bytes,
      created_at: new Date().toISOString(),
    });

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    // Return same shape your UI already expects
    return NextResponse.json({
      ok: true,
      callId: id,
      id,
      path: file_path,
      userId: user.id,
      filename,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "register_failed" },
      { status: 500 }
    );
  }
}
