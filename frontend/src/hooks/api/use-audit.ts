"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiReady } from "@/hooks/use-api-ready";
import { fetchAuditLogsPaginated } from "@/lib/api/services/audit.service";
import type { ListQuery } from "@/types/api";

export function useAuditLogsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["audit", "paginated", query],
    queryFn: () => fetchAuditLogsPaginated(query),
    enabled: apiReady,
  });
}
