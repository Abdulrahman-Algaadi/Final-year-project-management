import { Evaluation } from '@/database/entities/evaluation.entity';
import { GroupEvaluation } from '@/database/entities/group-evaluation.entity';
import { Injectable } from '@nestjs/common';
import { EvaluationResponseDto, GroupEvaluationResponseDto } from './dto/evaluation-response.dto';

@Injectable()
export class EvaluationMapper {
  toResponse(entity: Evaluation): EvaluationResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      totalMarks: entity.totalMarks,
      weight: Number(entity.weight),
    };
  }

  toGroupEvaluationResponse(entity: GroupEvaluation): GroupEvaluationResponseDto {
    return {
      id: entity.id,
      groupId: entity.groupId,
      evaluationId: entity.evaluationId,
      obtainedMarks: Number(entity.obtainedMarks),
      evaluationDate: entity.evaluationDate,
      evaluatedById: entity.evaluatedById,
      comments: entity.comments,
      isPublished: entity.isPublished,
    };
  }

  toResponseList(entities: Evaluation[]): EvaluationResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
