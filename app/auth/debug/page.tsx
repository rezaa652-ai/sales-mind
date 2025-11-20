// app/auth/debug/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DebugAuthPage() {
  const supabase = await supabaseServer(); // ✅ Correctly call the function

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <pre className="p-4 text-sm">
      {JSON.stringify({ user, error }, null, 2)}
    </pre>
  );
}
