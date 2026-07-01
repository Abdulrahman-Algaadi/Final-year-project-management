"use client";

import { useQuery } from "@tanstack/react-query";
import { mapGroup } from "@/lib/api/mappers/group.mapper";
import { fetchGroupMe, fetchReferenceData } from "@/lib/api/services/reference.service";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";

export function useGroupMe() {
  const { isDemo, user } = useSession();
  const { getDemoGroupForStudent } = useAppData();

  return useQuery({
    queryKey: ["groups", "me", isDemo, user?.id],
    queryFn: async () => {
      if (isDemo) {
        const studentId = user?.id ?? 1;
        return getDemoGroupForStudent(studentId) ?? null;
      }
      const [dto, ref] = await Promise.all([fetchGroupMe(), fetchReferenceData()]);
      return mapGroup(dto, ref);
    },
    enabled: user?.role === "Student",
  });
}
