import type { Project } from "@/types";
import type { ProjectDto, ReferenceData } from "@/types/api";

export function mapProject(dto: ProjectDto, ref?: ReferenceData): Project {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    semesterId: dto.semesterId,
    semesterName: dto.semesterName ?? ref?.semesters.get(dto.semesterId),
    statusId: dto.statusId,
    statusName: dto.statusName ?? "Pending",
    department:
      dto.departmentName ??
      (dto.departmentId != null ? ref?.departments.get(dto.departmentId)?.name : undefined),
    createdAt: typeof dto.createdAt === "string" ? dto.createdAt : new Date(dto.createdAt).toISOString(),
  };
}

export function mapProjectList(dtos: ProjectDto[], ref?: ReferenceData): Project[] {
  return dtos.map((d) => mapProject(d, ref));
}
