import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { GroupRepository, GroupStudentRepository, GroupProjectRepository } from './group.repository';
import { GroupMapper } from './group.mapper';
import { GroupPolicy } from './group.policy';
import { StudentRepository } from '@/modules/student/student.repository';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';

describe('GroupService', () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        GroupMapper,
        GroupPolicy,
        { provide: GroupRepository, useValue: {} },
        { provide: GroupStudentRepository, useValue: {} },
        { provide: GroupProjectRepository, useValue: {} },
        { provide: StudentRepository, useValue: {} },
        { provide: AdvisorRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
