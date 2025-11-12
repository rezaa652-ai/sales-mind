// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

console.log("🔑 Upload API: checking keys...");
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ found" : "❌ missing");
console.log("SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ found" : "❌ missing");

// ✅ Create server Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Convert the File into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name}`;

    // ✅ Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("calls")
      .upload(fileName, buffer, {
        contentType: file.type || "audio/mpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // ✅ Insert a record into Supabase DB
    const { error: insertError } = await supabase
      .from("calls")
      .insert({ file_path: fileName, status: "uploaded" });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, file: fileName });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err.message);
    return NextResponse.json({ success: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}
