import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { StudentService } from './student.service';
import { StudentRepository, StudentPersonRepository } from './student.repository';
import { StudentMapper } from './student.mapper';
import { StudentPolicy } from './student.policy';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        StudentMapper,
        StudentPolicy,
        { provide: StudentRepository, useValue: {} },
        { provide: StudentPersonRepository, useValue: {} },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        { provide: AdvisorRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
