"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdvisorsPaginated } from "@/lib/api/services/advisors.service";
import { fetchLookupsByCategory } from "@/lib/api/services/lookups.service";
import { useApiReady } from "@/hooks/use-api-ready";
import type { ListQuery } from "@/types/api";

export function useAdvisorsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["advisors", "paginated", query],
    queryFn: () => fetchAdvisorsPaginated(query),
    enabled: apiReady,
  });
}

export function useDesignationLookups() {
  return useQuery({
    queryKey: ["lookups", "Designation"],
    queryFn: () => fetchLookupsByCategory("Designation"),
    staleTime: 10 * 60_000,
  });
}
