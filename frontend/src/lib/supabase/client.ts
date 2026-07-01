import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, hasSupabaseConfig } from "@/lib/env";
import { loadRuntimeConfig } from "@/lib/runtime-config";

let browserClient: SupabaseClient | null = null;
let clientKey: string | null = null;

function resetClientIfConfigChanged(url: string, key: string): void {
  const nextKey = `${url}|${key}`;
  if (clientKey && clientKey !== nextKey) {
    browserClient = null;
  }
  clientKey = nextKey;
}

/** Returns null when Supabase env vars are not configured. */
export function createClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const url = getPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  resetClientIfConfigChanged(url, anonKey);

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }
  return browserClient;
}

/** Load runtime config from Vercel server, then return the Supabase client. */
export async function createClientAsync(): Promise<SupabaseClient | null> {
  await loadRuntimeConfig();
  return createClient();
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

/** Clears the singleton browser client after runtime config loads. */
export function resetSupabaseClient(): void {
  browserClient = null;
  clientKey = null;
}
