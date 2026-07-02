"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiReady } from "@/hooks/use-api-ready";
import { mapGroup } from "@/lib/api/mappers/group.mapper";
import { fetchGroupMe, fetchReferenceData } from "@/lib/api/services/reference.service";
import { useSession } from "@/providers/session-provider";

export function useGroupMe() {
  const { user } = useSession();
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["groups", "me", user?.id],
    queryFn: async () => {
      const [dto, ref] = await Promise.all([fetchGroupMe(), fetchReferenceData()]);
      return mapGroup(dto, ref);
    },
    enabled: user?.role === "Student" && apiReady,
  });
}
