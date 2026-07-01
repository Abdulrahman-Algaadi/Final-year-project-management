import type { Group } from "@/types";
import type { GroupDto, ReferenceData } from "@/types/api";
import { formatPersonName } from "@/lib/api/mappers/student.mapper";

export function mapGroup(dto: GroupDto, ref?: ReferenceData): Group {
  const leader = dto.members?.find((m) => m.isLeader);
  const projectId = dto.project?.projectId;

  return {
    id: dto.id,
    groupName: dto.groupName,
    memberCount: dto.members?.length ?? 0,
    leaderName: leader ? formatPersonName(ref, leader.studentId) : "—",
    projectTitle: projectId ? ref?.projects.get(projectId)?.title : undefined,
    status: "Active",
    createdOn: typeof dto.createdOn === "string" ? dto.createdOn : new Date(dto.createdOn).toISOString(),
  };
}

export function mapGroupList(dtos: GroupDto[], ref?: ReferenceData): Group[] {
  return dtos.map((d) => mapGroup(d, ref));
}
