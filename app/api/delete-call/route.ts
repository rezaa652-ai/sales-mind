import { supabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://dummy-project.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "dummy_supabase_key";

const supabase = supabaseServer;

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing call ID" }, { status: 400 });
    }

    
const supabase = await supabaseServer(); // ✅ call the function to get the client
const { error } = await supabase.from("calls").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Delete failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Delete call error:", e);
    return NextResponse.json(
      { error: "delete_call_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
