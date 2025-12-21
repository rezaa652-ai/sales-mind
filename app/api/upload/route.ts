import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Create Supabase client safely for API routes
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
            try {
              res.cookies.set(name, value, options as CookieOptions);
            } catch {
              /* ignore layout cookie errors */
            }
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
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (userErr || !user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "missing_file" }, { status: 400 });

    const id = crypto.randomUUID();
    const safeName = (file.name || "audio").replace(/\s+/g, "_");
    const path = `${user.id}/${id}_${safeName}`;

    console.log("📤 Uploading to Supabase:", path);

    // ✅ Upload file
    const { error: uploadErr } = await supabase.storage
      .from("calls")
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr)
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });

    // ✅ Create DB record
    const { error: dbErr } = await supabase.from("calls").insert({
      id,
      owner: user.id,
      filename: safeName,
      file_path: path,
      mime_type: file.type || null,
      size_bytes: file.size || null,
      created_at: new Date().toISOString(),
    });

    if (dbErr)
      return NextResponse.json({ error: dbErr.message }, { status: 500 });

    console.log("✅ Upload complete:", path);
    return NextResponse.json({
      ok: true,
      id,
      callId: id,
      path,
      userId: user.id,
      filename: safeName,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e?.message || "upload_failed" },
      { status: 500 }
    );
  }
}

