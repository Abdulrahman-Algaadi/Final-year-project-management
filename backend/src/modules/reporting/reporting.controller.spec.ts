import { Test, TestingModule } from '@nestjs/testing';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

describe('ReportingController', () => {
  let controller: ReportingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportingController],
      providers: [{ provide: ReportingService, useValue: {} }],
    }).compile();

    controller = module.get(ReportingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
