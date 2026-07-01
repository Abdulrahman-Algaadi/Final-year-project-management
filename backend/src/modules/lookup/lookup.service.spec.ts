import { Test, TestingModule } from '@nestjs/testing';
import { LookupService } from './lookup.service';
import { LookupRepository } from './lookup.repository';
import { LookupMapper } from './lookup.mapper';

describe('LookupService', () => {
  let service: LookupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LookupService, LookupMapper, { provide: LookupRepository, useValue: {} }],
    }).compile();

    service = module.get(LookupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
