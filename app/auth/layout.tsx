import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer(); // ✅ CALL function here

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user) redirect("/app/qa"); // already logged in → go to app

  return <>{children}</>;
}
