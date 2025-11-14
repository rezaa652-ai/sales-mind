import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filename = formData.get("filename") as string;

    if (!file || !filename) {
      return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = supabaseServer;

    // ✅ Upload safely using centralized helper
    const { data, error } = await supabase.storage
      .from("audio")
      .upload(filename, buffer, {
        upsert: true,
        contentType: file.type || "audio/mpeg",
      });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: data?.path });
  } catch (e: any) {
    console.error("upload route error:", e);
    return NextResponse.json(
      { error: "upload_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
