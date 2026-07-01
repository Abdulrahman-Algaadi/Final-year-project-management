import { DomainException } from '@/shared/exceptions/domain.exception';
import { ProjectStatusName } from '@/shared/types/enums';
import { ProjectErrors } from './project.errors';

export class ProjectPolicy {
  assertWritable(statusName?: string): void {
    if (
      statusName === ProjectStatusName.Archived ||
      statusName === ProjectStatusName.Completed
    ) {
      throw DomainException.businessRule(
        'Project is read-only when archived or completed',
        ProjectErrors.READ_ONLY,
      );
    }
  }

  isReadOnly(statusName?: string): boolean {
    return (
      statusName === ProjectStatusName.Archived ||
      statusName === ProjectStatusName.Completed
    );
  }
}
