import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './submission.repository';
import { SubmissionMapper } from './submission.mapper';
import { ProjectService } from '@/modules/project/project.service';

describe('SubmissionService', () => {
  let service: SubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        SubmissionMapper,
        { provide: SubmissionRepository, useValue: {} },
        { provide: ProjectService, useValue: {} },
      ],
    }).compile();

    service = module.get(SubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
