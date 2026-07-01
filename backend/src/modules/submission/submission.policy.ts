import { DomainException } from '@/shared/exceptions/domain.exception';
import { SubmissionErrors } from './submission.errors';

export class SubmissionPolicy {
  assertCanAccess(hasAccess: boolean): void {
    if (!hasAccess) {
      throw DomainException.forbidden('You do not have access to this submission', SubmissionErrors.ACCESS_DENIED);
    }
  }
}
