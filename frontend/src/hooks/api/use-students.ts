"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudents, fetchStudentsPaginated } from "@/lib/api/services/students.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useStudents(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["students", query],
    queryFn: () => fetchStudents(query),
    enabled: !isDemo,
  });
}

export function useStudentsPaginated(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["students", "paginated", query],
    queryFn: () => fetchStudentsPaginated(query),
    enabled: !isDemo,
  });
}
