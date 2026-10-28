import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Anonymous, read-only client for public pages. Returns null when env vars are missing. */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Cache Supabase reads for 60s (Next data cache) so pages don't wait on the database every click.
      global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60 } } as RequestInit) },
    }
  );
}
