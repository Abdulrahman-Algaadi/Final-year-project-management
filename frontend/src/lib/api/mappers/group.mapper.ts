import type { Group } from "@/types";
import type { GroupDto, ReferenceData } from "@/types/api";
import { formatPersonName } from "@/lib/api/mappers/student.mapper";

function formatAdvisorNames(dto: GroupDto, ref?: ReferenceData): string | undefined {
  const advisors = dto.advisors ?? [];
  if (advisors.length === 0) {
    return undefined;
  }
  const names = advisors
    .map((advisor) => formatPersonName(ref, advisor.advisorId))
    .filter((name) => name !== "—");
  return names.length > 0 ? names.join(", ") : undefined;
}

export function mapGroup(dto: GroupDto, ref?: ReferenceData): Group {
  const leader = dto.members?.find((m) => m.isLeader);
  const projectId = dto.project?.projectId;

  return {
    id: dto.id,
    groupName: dto.groupName,
    memberCount: dto.members?.length ?? 0,
    leaderName: leader ? formatPersonName(ref, leader.studentId) : "—",
    advisorNames: formatAdvisorNames(dto, ref),
    projectTitle: projectId ? ref?.projects.get(projectId)?.title : undefined,
    status: "Active",
    createdOn: typeof dto.createdOn === "string" ? dto.createdOn : new Date(dto.createdOn).toISOString(),
  };
}

export function mapGroupList(dtos: GroupDto[], ref?: ReferenceData): Group[] {
  return dtos.map((d) => mapGroup(d, ref));
}
