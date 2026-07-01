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
import { useSession } from "@/providers/session-provider";

export function useProjectsByDepartment() {
  const { isDemo } = useSession();

  return useQuery({
    queryKey: ["reports", "projects-by-department"],
    queryFn: fetchProjectsByDepartment,
    enabled: !isDemo,
  });
}

export function useStudentEnrollment() {
  const { isDemo } = useSession();

  return useQuery({
    queryKey: ["reports", "enrollment"],
    queryFn: fetchStudentEnrollment,
    enabled: !isDemo,
  });
}

export function useReportsData() {
  const { isDemo } = useSession();

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
    enabled: !isDemo,
  });
}
