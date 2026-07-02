"use client";

import { useSession } from "@/providers/session-provider";

/** True when a real Supabase session is loaded and API calls may include a Bearer token. */
export function useApiReady(): boolean {
  const { user, loading } = useSession();
  return !loading && !!user;
}
