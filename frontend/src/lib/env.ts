/**
 * Public env vars (inlined at build time on Vercel).
 * Set in Vercel → Project → Settings → Environment Variables.
 */

export function getPublicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  return process.env[name]?.trim() ?? "";
}

export function hasSupabaseConfig(): boolean {
  return Boolean(getPublicEnv("NEXT_PUBLIC_SUPABASE_URL") && getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export const env = {
  get apiUrl() {
    return process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000/api/v1";
  },
  get supabaseUrl() {
    const value = getPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
    if (!value) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL. Add it in Vercel Environment Variables and redeploy.",
      );
    }
    return value;
  },
  get supabaseAnonKey() {
    const value = getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!value) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it in Vercel Environment Variables and redeploy.",
      );
    }
    return value;
  },
} as const;
