import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Session-aware client for server components / route handlers (reads the admin's login cookie). */
export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* called from a Server Component: middleware refreshes the session instead */
          }
        },
      },
    }
  );
}
