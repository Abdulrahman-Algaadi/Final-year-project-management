import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { ReportingRepository } from './reporting.repository';
import { ReportingMapper } from './reporting.mapper';

describe('ReportingService', () => {
  let service: ReportingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
        ReportingMapper,
        { provide: ReportingRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(ReportingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
