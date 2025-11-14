// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://dummy-project.supabase.co"; // fallback for build

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "dummy_supabase_key"; // fallback for build

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_KEY);
