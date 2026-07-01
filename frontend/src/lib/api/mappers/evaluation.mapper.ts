import type { Evaluation, GroupEvaluation } from "@/types";
import type { EvaluationDto, GroupEvaluationDto, ReferenceData } from "@/types/api";
import { formatPersonName } from "@/lib/api/mappers/student.mapper";

export function mapEvaluation(dto: EvaluationDto): Evaluation {
  return {
    id: dto.id,
    name: dto.name,
    totalMarks: dto.totalMarks,
    weight: Number(dto.weight),
  };
}

export function mapGroupEvaluation(dto: GroupEvaluationDto, ref?: ReferenceData): GroupEvaluation {
  const evaluation = ref?.evaluations.get(dto.evaluationId);
  return {
    id: dto.id,
    groupId: dto.groupId,
    groupName: ref?.groups.get(dto.groupId)?.groupName ?? `Group #${dto.groupId}`,
    evaluationName: evaluation?.name ?? `Evaluation #${dto.evaluationId}`,
    obtainedMarks: dto.obtainedMarks,
    totalMarks: evaluation?.totalMarks ?? dto.obtainedMarks,
    isPublished: dto.isPublished,
    evaluationDate: dto.evaluationDate,
    evaluatorName: formatPersonName(ref, dto.evaluatedById),
    comments: dto.comments,
  };
}

export function mapGroupEvaluationList(dtos: GroupEvaluationDto[], ref?: ReferenceData): GroupEvaluation[] {
  return dtos.map((d) => mapGroupEvaluation(d, ref));
}
