/**
 * Client-side public env vars (inlined at build time on Vercel).
 * All must be set in Vercel → Project → Settings → Environment Variables.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it in Vercel Environment Variables or frontend/.env.local`,
    );
  }
  return value;
}

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} as const;
