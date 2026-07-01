import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, hasSupabaseConfig } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

/** Returns null when Supabase env vars are not configured (e.g. missing on Vercel). */
export function createClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      getPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
  }
  return browserClient;
}

export function requireClient(): SupabaseClient {
  const client = createClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel, then redeploy.",
    );
  }
  return client;
}
