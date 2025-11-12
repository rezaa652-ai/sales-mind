import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { type CookieOptions } from "@supabase/ssr";

export async function supabaseServer() {
  const cookieStore = await cookies(); // ✅ fix: await required in Next 15
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op fix for "Cookies can only be modified..." warning
        },
      },
    }
  );
}
