"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects, fetchProjectsPaginated } from "@/lib/api/services/projects.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useProjects(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["projects", query],
    queryFn: () => fetchProjects(query),
    enabled: !isDemo,
  });
}

export function useProjectsPaginated(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["projects", "paginated", query],
    queryFn: () => fetchProjectsPaginated(query),
    enabled: !isDemo,
  });
}
