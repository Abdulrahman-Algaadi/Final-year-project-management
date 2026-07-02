import type { Advisor } from "@/types";
import type { AdvisorDto } from "@/types/api";

export interface AdvisorMapperContext {
  departments: Map<number, { name: string; code: string }>;
  designations: Map<number, string>;
}

export function mapAdvisor(dto: AdvisorDto, ctx?: AdvisorMapperContext): Advisor {
  const dept = ctx?.departments.get(dto.departmentId);
  return {
    id: dto.id,
    firstName: dto.firstName ?? "",
    lastName: dto.lastName ?? "",
    email: dto.email ?? "",
    department: dept ? `${dept.code} — ${dept.name}` : "—",
    departmentId: dto.departmentId,
    designation: ctx?.designations.get(dto.designationId) ?? "—",
    designationId: dto.designationId,
    salary: dto.salary,
  };
}

export function mapAdvisorList(dtos: AdvisorDto[], ctx?: AdvisorMapperContext): Advisor[] {
  return dtos.map((d) => mapAdvisor(d, ctx));
}
