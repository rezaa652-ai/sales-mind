import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}_${file.name}`;

    // ✅ Upload safely using Supabase client
    const { data, error } = await supabase.storage
      .from("audio")
      .upload(filename, buffer, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      console.error("Upload error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, file: data });
  } catch (e: any) {
    console.error("Upload route error:", e);
    return NextResponse.json(
      { error: "upload_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
