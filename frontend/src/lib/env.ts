/**
 * Public env vars — build-time NEXT_PUBLIC_* or runtime /api/public-config on Vercel.
 */
import { getRuntimeConfig } from "@/lib/runtime-config";

export function getPublicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const runtime = getRuntimeConfig();
  if (name === "NEXT_PUBLIC_SUPABASE_URL") {
    return (
      runtime?.supabaseUrl ??
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
      process.env.SUPABASE_URL?.trim() ??
      ""
    );
  }
  return (
    runtime?.supabaseAnonKey ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim() ??
    ""
  );
}

export function hasSupabaseConfig(): boolean {
  return Boolean(getPublicEnv("NEXT_PUBLIC_SUPABASE_URL") && getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

/** Names of public env vars missing from this deployment. */
export function getMissingPublicEnvVars(): string[] {
  const missing: string[] = [];
  if (!getPublicEnv("NEXT_PUBLIC_SUPABASE_URL")) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)");
  }
  if (!getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)");
  }
  if (!getApiUrl()) {
    missing.push("NEXT_PUBLIC_API_URL (or API_URL)");
  }
  return missing;
}

export function getApiUrl(): string {
  const runtime = getRuntimeConfig();
  return (
    runtime?.apiUrl ??
    process.env.NEXT_PUBLIC_API_URL?.trim() ??
    process.env.API_URL?.trim() ??
    "http://localhost:3000/api/v1"
  );
}

export const env = {
  get apiUrl() {
    return getApiUrl();
  },
  get supabaseUrl() {
    const value = getPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
    if (!value) {
      throw new Error(
        "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL on Vercel (or SUPABASE_URL) and redeploy.",
      );
    }
    return value;
  },
  get supabaseAnonKey() {
    const value = getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!value) {
      throw new Error(
        "Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel (or SUPABASE_ANON_KEY) and redeploy.",
      );
    }
    return value;
  },
} as const;
