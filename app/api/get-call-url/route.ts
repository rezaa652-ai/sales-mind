import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path) {
      return NextResponse.json({ error: "missing_path" }, { status: 400 });
    }

    const supabase = await supabaseServer();
    const { data, error } = await supabase.storage
      .from("calls")
      .createSignedUrl(path, 60 * 10); // 10 min valid

    if (error) {
      console.error("Signed URL error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data?.signedUrl || null });
  } catch (e: any) {
    console.error("get-call-url error:", e);
    return NextResponse.json(
      { error: "server_error", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
