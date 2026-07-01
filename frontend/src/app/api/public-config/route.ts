import { NextResponse } from "next/server";

/** Runtime public config — reads Vercel env at request time (no NEXT_PUBLIC rebuild required). */
export async function GET() {
  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  )?.trim();
  const supabaseAnonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  )?.trim();
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "https://fypms-api.onrender.com/api/v1"
  ).trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        configured: false,
        missing: [
          !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL" : null,
          !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY" : null,
        ].filter(Boolean),
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    configured: true,
    supabaseUrl,
    supabaseAnonKey,
    apiUrl,
  });
}
