import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("behavior_personas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ✅ Always return as { personas: [...] }
    return NextResponse.json({ personas: data });
  } catch (e: any) {
    console.error("get_personas_failed:", e);
    return NextResponse.json(
      { error: "get_personas_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
