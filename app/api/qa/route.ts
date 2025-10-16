import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  // Use Next 15 cookie store directly (type-safe with @supabase/ssr)
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return new NextResponse(`Auth error: ${error.message}`, { status: 401 });
  }
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
