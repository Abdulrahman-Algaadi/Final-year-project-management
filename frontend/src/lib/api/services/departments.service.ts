import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { mapDepartmentList } from "@/lib/api/mappers/department.mapper";
import type { Department } from "@/types";
import type { DepartmentDto, ListQuery, StudentEnrollmentReportDto } from "@/types/api";

async function fetchEnrollment(): Promise<StudentEnrollmentReportDto[]> {
  return apiClient<StudentEnrollmentReportDto[]>("/reports/students/enrollment");
}

export async function fetchDepartments(query?: ListQuery): Promise<Department[]> {
  const [result, enrollment] = await Promise.all([
    apiGetPaginated<DepartmentDto>("/departments", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 100,
      search: query?.search,
    }),
    fetchEnrollment().catch(() => []),
  ]);
  return mapDepartmentList(result.items, enrollment);
}

export async function createDepartment(input: { name: string; code: string }): Promise<Department> {
  const created = await apiClient<DepartmentDto>("/departments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapDepartmentList([created])[0];
}

export async function updateDepartment(
  id: number,
  input: { name?: string; code?: string },
): Promise<Department> {
  const updated = await apiClient<DepartmentDto>(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return mapDepartmentList([updated])[0];
}

export async function deleteDepartment(id: number): Promise<void> {
  await apiClient<void>(`/departments/${id}`, { method: "DELETE" });
}
