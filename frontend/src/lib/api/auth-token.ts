import { createClient } from "@/lib/supabase/client";

let cachedAccessToken: string | null = null;

/** Set after sign-in / session load so API calls work before getSession() catches up. */
export function setCachedAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

export async function getAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  cachedAccessToken = session?.access_token ?? null;
  return cachedAccessToken;
}
