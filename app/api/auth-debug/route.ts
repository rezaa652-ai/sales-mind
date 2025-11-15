import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const headers = Object.fromEntries((req as any).headers.entries());
  const cookies = headers.cookie || "❌ No cookies sent";
  return NextResponse.json({
    cookies,
    userAgent: headers["user-agent"],
    host: headers["host"],
    env: {
      URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ missing",
      ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ found" : "❌ missing",
    }
  });
}
