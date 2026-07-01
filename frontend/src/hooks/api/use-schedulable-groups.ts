"use client";

import { useMemo } from "react";
import { useGroupsPaginated } from "@/hooks/api/use-groups";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";

/** Groups available when scheduling meetings or recording grades. */
export function useSchedulableGroups() {
  const { user, isDemo } = useSession();
  const { groups: mockGroups, meetings: mockMeetings } = useAppData();
  const isAdvisor = user?.role === "Advisor";
  const { data: paginated, isLoading } = useGroupsPaginated({ limit: 100 });

  const groups = useMemo(() => {
    if (isDemo) {
      if (isAdvisor && user) {
        const name = `${user.firstName} ${user.lastName}`;
        const ids = new Set(
          mockMeetings.filter((m) => m.advisorName.includes(name)).map((m) => m.groupId),
        );
        return mockGroups.filter((g) => ids.has(g.id));
      }
      return mockGroups;
    }
    return paginated?.items ?? [];
  }, [isDemo, isAdvisor, user, mockGroups, mockMeetings, paginated?.items]);

  return {
    groups,
    isLoading: !isDemo && isLoading,
  };
}
