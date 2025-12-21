import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id)
      return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const supabase = await supabaseServer();

    // ✅ 1. Fetch file path before deleting
    const { data: call, error: fetchErr } = await supabase
      .from("calls")
      .select("file_path")
      .eq("id", id)
      .single();

    if (fetchErr || !call)
      return NextResponse.json(
        { error: "call_not_found", detail: fetchErr?.message },
        { status: 404 }
      );

    // ✅ 2. Delete from storage
    const { error: storageErr } = await supabase.storage
      .from("calls")
      .remove([call.file_path]);

    if (storageErr)
      console.warn("Storage delete warning:", storageErr.message);

    // ✅ 3. Delete from calls (which cascades to transcripts/personas)
    const { error: dbErr } = await supabase.from("calls").delete().eq("id", id);
    if (dbErr)
      return NextResponse.json(
        { error: "delete_failed", detail: dbErr.message },
        { status: 500 }
      );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("delete-call error:", e);
    return NextResponse.json(
      { error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
