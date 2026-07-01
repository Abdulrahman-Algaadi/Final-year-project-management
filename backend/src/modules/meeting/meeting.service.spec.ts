import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from './meeting.service';
import { MeetingRepository } from './meeting.repository';
import { MeetingMapper } from './meeting.mapper';
import { MeetingPolicy } from './meeting.policy';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { NotificationService } from '@/modules/notification/notification.service';
import { AuditService } from '@/modules/audit/audit.service';

describe('MeetingService', () => {
  let service: MeetingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        MeetingMapper,
        MeetingPolicy,
        { provide: MeetingRepository, useValue: {} },
        { provide: AdvisorRepository, useValue: {} },
        { provide: StudentRepository, useValue: {} },
        { provide: GroupStudentRepository, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: AuditService, useValue: {} },
      ],
    }).compile();

    service = module.get(MeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
