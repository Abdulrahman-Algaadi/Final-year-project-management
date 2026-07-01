"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllGroupEvaluations,
  fetchEvaluations,
  fetchEvaluationsPaginated,
  fetchGroupEvaluations,
  fetchGroupEvaluationsPaginated,
} from "@/lib/api/services/evaluations.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useEvaluations(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["evaluations", "rubrics", query],
    queryFn: () => fetchEvaluations(query),
    enabled: !isDemo,
  });
}

export function useEvaluationsPaginated(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["evaluations", "rubrics", "paginated", query],
    queryFn: () => fetchEvaluationsPaginated(query),
    enabled: !isDemo,
  });
}

export function useGroupEvaluations(groupId?: number, fetchAll = false) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["evaluations", "grades", groupId, fetchAll],
    queryFn: () => {
      if (groupId) return fetchGroupEvaluations(groupId);
      if (fetchAll) return fetchAllGroupEvaluations();
      return Promise.resolve([]);
    },
    enabled: !isDemo && (fetchAll || groupId !== undefined),
  });
}

export function useGroupEvaluationsPaginated(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["evaluations", "grades", "paginated", query],
    queryFn: () => fetchGroupEvaluationsPaginated(query),
    enabled: !isDemo && query !== undefined,
  });
}
