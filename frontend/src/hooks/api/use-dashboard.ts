"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminDashboard,
  fetchAdvisorDashboard,
  fetchStudentDashboard,
} from "@/lib/api/services/reports.service";
import { useSession } from "@/providers/session-provider";

export function useAdminDashboard() {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: fetchAdminDashboard,
    enabled: !isDemo,
  });
}

export function useAdvisorDashboard() {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["dashboard", "advisor"],
    queryFn: fetchAdvisorDashboard,
    enabled: !isDemo,
  });
}

export function useStudentDashboard() {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: fetchStudentDashboard,
    enabled: !isDemo,
  });
}
