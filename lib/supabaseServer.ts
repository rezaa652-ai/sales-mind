import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServer() {
  const cookieStore = cookies(); // ✅ synchronous in Next.js 15

  // ✅ Read-only Supabase client for use in layouts and server components
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll();
          } catch {
            return [];
          }
        },
        // 🚫 No writes allowed here (Next.js 15 restriction)
        setAll() {
          if (process.env.NODE_ENV === "development") {
            console.warn("[supabaseServer] Cookie write attempted in layout — blocked.");
          }
        },
      },
    }
  );

  return supabase;
}
