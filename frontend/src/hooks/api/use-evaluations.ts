"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllGroupEvaluations,
  fetchEvaluations,
  fetchEvaluationsPaginated,
  fetchGroupEvaluations,
  fetchGroupEvaluationsPaginated,
} from "@/lib/api/services/evaluations.service";
import { useApiReady } from "@/hooks/use-api-ready";
import type { ListQuery } from "@/types/api";

export function useEvaluations(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["evaluations", "rubrics", query],
    queryFn: () => fetchEvaluations(query),
    enabled: apiReady,
  });
}

export function useEvaluationsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["evaluations", "rubrics", "paginated", query],
    queryFn: () => fetchEvaluationsPaginated(query),
    enabled: apiReady,
  });
}

export function useGroupEvaluations(groupId?: number, fetchAll = false) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["evaluations", "grades", groupId, fetchAll],
    queryFn: () => {
      if (groupId) return fetchGroupEvaluations(groupId);
      if (fetchAll) return fetchAllGroupEvaluations();
      return Promise.resolve([]);
    },
    enabled: apiReady && (fetchAll || groupId !== undefined),
  });
}

export function useGroupEvaluationsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["evaluations", "grades", "paginated", query],
    queryFn: () => fetchGroupEvaluationsPaginated(query),
    enabled: apiReady && query !== undefined,
  });
}
