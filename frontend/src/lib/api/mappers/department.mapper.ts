import type { Department } from "@/types";
import type { DepartmentDto, ReferenceData, StudentEnrollmentReportDto } from "@/types/api";

export function mapDepartment(
  dto: DepartmentDto,
  enrollment?: StudentEnrollmentReportDto[],
): Department {
  const count = enrollment?.find((e) => e.departmentId === dto.id)?.studentCount ?? 0;
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    studentCount: count,
    createdAt: typeof dto.createdAt === "string" ? dto.createdAt : new Date(dto.createdAt).toISOString(),
  };
}

export function mapDepartmentList(
  dtos: DepartmentDto[],
  enrollment?: StudentEnrollmentReportDto[],
): Department[] {
  return dtos.map((d) => mapDepartment(d, enrollment));
}
