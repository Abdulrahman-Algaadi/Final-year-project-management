import { Test, TestingModule } from '@nestjs/testing';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

describe('MeetingController', () => {
  let controller: MeetingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingController],
      providers: [{ provide: MeetingService, useValue: {} }],
    }).compile();

    controller = module.get(MeetingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
