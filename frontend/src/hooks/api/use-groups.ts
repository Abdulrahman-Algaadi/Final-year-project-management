"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGroups, fetchGroupsPaginated, fetchGroupDetail } from "@/lib/api/services/groups.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useGroups(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["groups", query],
    queryFn: () => fetchGroups(query),
    enabled: !isDemo,
  });
}

export function useGroupsPaginated(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["groups", "paginated", query],
    queryFn: () => fetchGroupsPaginated(query),
    enabled: !isDemo,
  });
}

export function useGroupDetail(id?: number) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["groups", "detail", id],
    queryFn: () => fetchGroupDetail(id!),
    enabled: !isDemo && id !== undefined,
  });
}
