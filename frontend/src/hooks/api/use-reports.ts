"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminDashboard,
  fetchProjectSummary,
  fetchProjectsByDepartment,
  fetchEvaluationSummaries,
  fetchStudentEnrollment,
  fetchSubmissionSummary,
} from "@/lib/api/services/reports.service";
import { useApiReady } from "@/hooks/use-api-ready";

export function useProjectsByDepartment() {
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["reports", "projects-by-department"],
    queryFn: fetchProjectsByDepartment,
    enabled: apiReady,
  });
}

export function useStudentEnrollment() {
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["reports", "enrollment"],
    queryFn: fetchStudentEnrollment,
    enabled: apiReady,
  });
}

export function useReportsData() {
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [summary, enrollment, submissionSummary, evaluationSummary, overview] = await Promise.all([
        fetchProjectSummary(),
        fetchStudentEnrollment(),
        fetchSubmissionSummary(),
        fetchEvaluationSummaries(),
        fetchAdminDashboard(),
      ]);
      return { summary, enrollment, submissionSummary, evaluationSummary, overview };
    },
    enabled: apiReady,
  });
}
