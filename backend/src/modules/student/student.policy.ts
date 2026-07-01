import { DomainException } from '@/shared/exceptions/domain.exception';
import { StudentErrors } from './student.errors';

export class StudentPolicy {
  assertRegistrationImmutable(
    attemptedRegistrationNo: string | undefined,
    currentRegistrationNo: string,
  ): void {
    if (attemptedRegistrationNo && attemptedRegistrationNo !== currentRegistrationNo) {
      throw DomainException.businessRule(
        'Registration number cannot be changed',
        StudentErrors.REGISTRATION_IMMUTABLE,
      );
    }
  }
}
