import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("⚠️ Not authenticated");
      return NextResponse.json({ calls: [] });
    }

    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .eq("owner", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ calls: data || [] });
  } catch (e: any) {
    console.error("❌ get-calls route error:", e);
    return NextResponse.json(
      { error: "get_calls_failed", detail: e.message || String(e) },
      { status: 500 }
    );
  }
}
