import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ missing",
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ present" : "❌ missing",
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ present" : "❌ missing",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅ present" : "❌ missing",
    ENV_MODE: process.env.NODE_ENV,
  });
}
