"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogsPaginated } from "@/lib/api/services/audit.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useAuditLogsPaginated(query?: ListQuery) {
  const { isDemo } = useSession();

  return useQuery({
    queryKey: ["audit", "paginated", query],
    queryFn: () => fetchAuditLogsPaginated(query),
    enabled: !isDemo,
  });
}
