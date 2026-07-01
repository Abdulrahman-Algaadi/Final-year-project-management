import { apiClient } from "@/lib/api/client";
import type {
  AdminDashboardDto,
  AdvisorDashboardDto,
  ProjectByDepartmentReportDto,
  EvaluationSummaryReportDto,
  ProjectSummaryReportDto,
  StudentDashboardDto,
  StudentEnrollmentReportDto,
  SubmissionSummaryReportDto,
} from "@/types/api";

export async function fetchAdminDashboard(): Promise<AdminDashboardDto> {
  return apiClient<AdminDashboardDto>("/dashboard/admin");
}

export async function fetchAdvisorDashboard(): Promise<AdvisorDashboardDto> {
  return apiClient<AdvisorDashboardDto>("/dashboard/advisor");
}

export async function fetchStudentDashboard(): Promise<StudentDashboardDto> {
  return apiClient<StudentDashboardDto>("/dashboard/student");
}

export async function fetchProjectSummary(): Promise<ProjectSummaryReportDto> {
  return apiClient<ProjectSummaryReportDto>("/reports/projects/summary");
}

export async function fetchStudentEnrollment(): Promise<StudentEnrollmentReportDto[]> {
  return apiClient<StudentEnrollmentReportDto[]>("/reports/students/enrollment");
}

export async function fetchProjectsByDepartment(): Promise<ProjectByDepartmentReportDto[]> {
  return apiClient<ProjectByDepartmentReportDto[]>("/reports/projects/by-department");
}

export async function fetchEvaluationSummaries(): Promise<EvaluationSummaryReportDto[]> {
  return apiClient<EvaluationSummaryReportDto[]>("/reports/evaluations/summary");
}

export async function fetchSubmissionSummary(): Promise<SubmissionSummaryReportDto> {
  return apiClient<SubmissionSummaryReportDto>("/reports/submissions/summary");
}
