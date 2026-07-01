import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AdvisorService } from './advisor.service';
import { AdvisorRepository, AdvisorPersonRepository } from './advisor.repository';
import { AdvisorMapper } from './advisor.mapper';

describe('AdvisorService', () => {
  let service: AdvisorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvisorService,
        AdvisorMapper,
        { provide: AdvisorRepository, useValue: {} },
        { provide: AdvisorPersonRepository, useValue: {} },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
      ],
    }).compile();

    service = module.get(AdvisorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
