"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import { useSession } from "@/providers/session-provider";

/** Warm reference cache after login so list pages skip the heavy /reference round-trip. */
export function ReferencePrefetcher() {
  const { user, loading } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || loading) return;
    void queryClient.prefetchQuery({
      queryKey: ["reference"],
      queryFn: fetchReferenceData,
      staleTime: 5 * 60_000,
    });
  }, [user, loading, queryClient]);

  return null;
}
