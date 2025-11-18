import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServer() {
  const cookieStore = await cookies(); // ✅ must be awaited in Next.js 15+

  // ✅ Read-only Supabase client for layouts and RSC
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
        // 🚫 Disable writes outside route handlers
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
