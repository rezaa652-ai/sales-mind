import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id, file_path } = await req.json();
    if (!id || !file_path) throw new Error("Missing id or file_path");

    // 1️⃣ Delete file from storage
    const { error: storageError } = await supabase.storage.from("calls").remove([file_path]);
    if (storageError) console.warn("Storage delete error:", storageError);

    // 2️⃣ Delete record from table
    const { error: dbError } = await supabase.from("calls").delete().eq("id", id);
    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
