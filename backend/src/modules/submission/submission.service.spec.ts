import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './submission.repository';
import { SubmissionMapper } from './submission.mapper';
import { SubmissionPolicy } from './submission.policy';
import { ProjectService } from '@/modules/project/project.service';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { SupabaseService } from '@/shared/services/supabase.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { AuditService } from '@/modules/audit/audit.service';

describe('SubmissionService', () => {
  let service: SubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        SubmissionMapper,
        SubmissionPolicy,
        { provide: SubmissionRepository, useValue: {} },
        { provide: ProjectService, useValue: {} },
        { provide: AdvisorRepository, useValue: {} },
        { provide: StudentRepository, useValue: {} },
        { provide: GroupStudentRepository, useValue: {} },
        { provide: SupabaseService, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: AuditService, useValue: {} },
      ],
    }).compile();

    service = module.get(SubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
