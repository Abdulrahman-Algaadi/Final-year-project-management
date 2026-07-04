import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationService } from './evaluation.service';
import { EvaluationRepository, GroupEvaluationRepository, ProjectAdvisorLookupRepository } from './evaluation.repository';
import { EvaluationMapper } from './evaluation.mapper';
import { EvaluationPolicy } from './evaluation.policy';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { NotificationService } from '@/modules/notification/notification.service';

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        EvaluationMapper,
        EvaluationPolicy,
        { provide: EvaluationRepository, useValue: {} },
        { provide: GroupEvaluationRepository, useValue: {} },
        { provide: ProjectAdvisorLookupRepository, useValue: {} },
        { provide: AdvisorRepository, useValue: {} },
        { provide: StudentRepository, useValue: {} },
        { provide: GroupStudentRepository, useValue: {} },
        { provide: NotificationService, useValue: { notifyGroupMembers: jest.fn() } },
      ],
    }).compile();

    service = module.get(EvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
