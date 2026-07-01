import { DomainException } from '@/shared/exceptions/domain.exception';
import { MeetingErrors } from './meeting.errors';

export class MeetingPolicy {
  assertCanAccess(hasAccess: boolean): void {
    if (!hasAccess) {
      throw DomainException.forbidden('You do not have access to this meeting', MeetingErrors.ACCESS_DENIED);
    }
  }

  assertNotInPast(meetingDate: Date | string): void {
    const date = meetingDate instanceof Date ? meetingDate : new Date(meetingDate);
    if (date.getTime() < Date.now()) {
      throw DomainException.businessRule(
        'Meetings cannot be scheduled in the past',
        MeetingErrors.PAST_DATE,
      );
    }
  }
}
