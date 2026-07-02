"use client";

import { useGroupsPaginated } from "@/hooks/api/use-groups";

/** Groups available when scheduling meetings or recording grades. */
export function useSchedulableGroups() {
  const { data: paginated, isLoading } = useGroupsPaginated({ limit: 100 });

  return {
    groups: paginated?.items ?? [],
    isLoading,
  };
}
