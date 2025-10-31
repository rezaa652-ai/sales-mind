import AppNav from '@/components/AppNav'
// app/app/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = 'nodejs'
export const runtime = "nodejs";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/auth");

  return <AppShell>{children}</AppShell>;
}
