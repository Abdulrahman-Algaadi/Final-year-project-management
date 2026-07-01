"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudents, fetchStudentsPaginated } from "@/lib/api/services/students.service";
import { useApiReady } from "@/hooks/use-api-ready";
import type { ListQuery } from "@/types/api";

export function useStudents(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["students", query],
    queryFn: () => fetchStudents(query),
    enabled: apiReady,
  });
}

export function useStudentsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["students", "paginated", query],
    queryFn: () => fetchStudentsPaginated(query),
    enabled: apiReady,
  });
}
