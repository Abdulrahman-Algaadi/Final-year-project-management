import { DomainException } from '@/shared/exceptions/domain.exception';
import { GroupStudent } from '@/database/entities/group-student.entity';
import { GroupErrors } from './group.errors';

export class GroupPolicy {
  assertSingleActiveGroup(existingMembership: GroupStudent | null): void {
    if (existingMembership) {
      throw DomainException.businessRule(
        'Student already belongs to an active group',
        GroupErrors.STUDENT_ALREADY_IN_GROUP,
      );
    }
  }

  assertLeaderUnique(existingLeader: GroupStudent | null, isLeader: boolean): void {
    if (isLeader && existingLeader) {
      throw DomainException.businessRule(
        'Group already has a leader',
        GroupErrors.LEADER_ALREADY_EXISTS,
      );
    }
  }
}
