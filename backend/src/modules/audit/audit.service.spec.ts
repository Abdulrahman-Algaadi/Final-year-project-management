import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { AuditMapper } from './audit.mapper';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService, AuditMapper, { provide: AuditRepository, useValue: {} }],
    }).compile();

    service = module.get(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
