import { Test, TestingModule } from '@nestjs/testing';
import { SemesterService } from './semester.service';
import { SemesterRepository } from './semester.repository';
import { SemesterMapper } from './semester.mapper';

describe('SemesterService', () => {
  let service: SemesterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemesterService,
        SemesterMapper,
        { provide: SemesterRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(SemesterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
