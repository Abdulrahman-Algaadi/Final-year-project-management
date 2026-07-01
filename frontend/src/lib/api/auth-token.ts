import { createClient } from "@/lib/supabase/client";

export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
