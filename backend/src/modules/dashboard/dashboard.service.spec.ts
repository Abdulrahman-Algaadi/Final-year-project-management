import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useValue: {} },
        { provide: StudentRepository, useValue: {} },
        { provide: AdvisorRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
