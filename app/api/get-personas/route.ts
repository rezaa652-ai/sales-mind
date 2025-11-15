import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = supabaseServer;

  try {
    const { data, error } = await supabase.from("behavior_personas").select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { error: "get_personas_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
