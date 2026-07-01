import { DomainException } from '@/shared/exceptions/domain.exception';
import { Evaluation } from '@/database/entities/evaluation.entity';
import { EvaluationErrors } from './evaluation.errors';

export class EvaluationPolicy {
  assertMarksWithinTotal(obtainedMarks: number, evaluation: Evaluation): void {
    if (obtainedMarks > evaluation.totalMarks) {
      throw DomainException.businessRule(
        `Obtained marks (${obtainedMarks}) cannot exceed total (${evaluation.totalMarks})`,
        EvaluationErrors.MARKS_EXCEED_TOTAL,
      );
    }
  }

  assertAdvisorAssigned(isAssigned: boolean): void {
    if (!isAssigned) {
      throw DomainException.forbidden(
        'Only assigned advisors can evaluate',
        EvaluationErrors.ADVISOR_NOT_ASSIGNED,
      );
    }
  }
}
