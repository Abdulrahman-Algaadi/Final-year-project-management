import { Test, TestingModule } from '@nestjs/testing';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';

describe('SemesterController', () => {
  let controller: SemesterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemesterController],
      providers: [{ provide: SemesterService, useValue: {} }],
    }).compile();

    controller = module.get(SemesterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
