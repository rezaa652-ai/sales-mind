import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = supabaseServer;
    const { data, error } = await supabase.from("calls").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error("get-calls route error:", e);
    return NextResponse.json(
      { error: "get_calls_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
