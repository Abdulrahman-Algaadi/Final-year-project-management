"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects, fetchProjectsPaginated } from "@/lib/api/services/projects.service";
import { useApiReady } from "@/hooks/use-api-ready";
import type { ListQuery } from "@/types/api";

export function useProjects(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["projects", query],
    queryFn: () => fetchProjects(query),
    enabled: apiReady,
  });
}

export function useProjectsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["projects", "paginated", query],
    queryFn: () => fetchProjectsPaginated(query),
    enabled: apiReady,
  });
}
