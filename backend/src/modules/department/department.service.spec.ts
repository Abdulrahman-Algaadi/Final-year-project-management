import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './department.repository';
import { DepartmentMapper } from './department.mapper';

describe('DepartmentService', () => {
  let service: DepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        DepartmentMapper,
        {
          provide: DepartmentRepository,
          useValue: { findAll: jest.fn(), findById: jest.fn(), findByCode: jest.fn(), create: jest.fn(), save: jest.fn(), softDelete: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(DepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
