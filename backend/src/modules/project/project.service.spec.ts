import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository, ProjectStatusRepository } from './project.repository';
import { ProjectMapper } from './project.mapper';
import { ProjectPolicy } from './project.policy';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        ProjectMapper,
        ProjectPolicy,
        { provide: ProjectRepository, useValue: {} },
        { provide: ProjectStatusRepository, useValue: {} },
        { provide: AdvisorRepository, useValue: {} },
        { provide: StudentRepository, useValue: {} },
        { provide: GroupStudentRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
