"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiReady } from "@/hooks/use-api-ready";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import { useSession } from "@/providers/session-provider";

const REFERENCE_STALE_MS = 5 * 60_000;

export function useReferenceData() {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["reference"],
    queryFn: fetchReferenceData,
    staleTime: REFERENCE_STALE_MS,
    gcTime: REFERENCE_STALE_MS * 2,
    enabled: apiReady,
  });
}
