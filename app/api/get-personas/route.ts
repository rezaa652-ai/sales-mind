import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("behavior_personas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ personas: [], error: error.message });
  return NextResponse.json({ personas: data });
}
