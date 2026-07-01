"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGroups, fetchGroupsPaginated, fetchGroupDetail } from "@/lib/api/services/groups.service";
import { useApiReady } from "@/hooks/use-api-ready";
import type { ListQuery } from "@/types/api";

export function useGroups(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["groups", query],
    queryFn: () => fetchGroups(query),
    enabled: apiReady,
  });
}

export function useGroupsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["groups", "paginated", query],
    queryFn: () => fetchGroupsPaginated(query),
    enabled: apiReady,
  });
}

export function useGroupDetail(id?: number) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["groups", "detail", id],
    queryFn: () => fetchGroupDetail(id!),
    enabled: apiReady && id !== undefined,
  });
}
