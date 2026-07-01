import type { Submission } from "@/types";
import type { ReferenceData, SubmissionDto } from "@/types/api";

export function mapSubmission(dto: SubmissionDto, ref?: ReferenceData): Submission {
  return {
    id: dto.id,
    groupId: dto.groupId,
    groupName: ref?.groups.get(dto.groupId)?.groupName ?? `Group #${dto.groupId}`,
    title: dto.title,
    submissionType: dto.submissionType ?? "Other",
    status: dto.status,
    versionNo: dto.versionNo,
    submittedAt: typeof dto.submittedAt === "string" ? dto.submittedAt : new Date(dto.submittedAt).toISOString(),
    filePath: dto.filePath,
  };
}

export function mapSubmissionList(dtos: SubmissionDto[], ref?: ReferenceData): Submission[] {
  return dtos.map((d) => mapSubmission(d, ref));
}
