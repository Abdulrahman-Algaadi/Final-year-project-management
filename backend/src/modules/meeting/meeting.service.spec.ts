import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from './meeting.service';
import { MeetingRepository } from './meeting.repository';
import { MeetingMapper } from './meeting.mapper';
import { MeetingPolicy } from './meeting.policy';

describe('MeetingService', () => {
  let service: MeetingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        MeetingMapper,
        MeetingPolicy,
        { provide: MeetingRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(MeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
