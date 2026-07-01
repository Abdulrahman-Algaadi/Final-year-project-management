"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiReady } from "@/hooks/use-api-ready";
import {
  fetchAdminDashboard,
  fetchAdvisorDashboard,
  fetchStudentDashboard,
} from "@/lib/api/services/reports.service";

export function useAdminDashboard() {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: fetchAdminDashboard,
    enabled: apiReady,
  });
}

export function useAdvisorDashboard() {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["dashboard", "advisor"],
    queryFn: fetchAdvisorDashboard,
    enabled: apiReady,
  });
}

export function useStudentDashboard() {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: fetchStudentDashboard,
    enabled: apiReady,
  });
}
