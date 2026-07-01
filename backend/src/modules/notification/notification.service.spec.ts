import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationMapper } from './notification.mapper';
import { GroupStudentRepository } from '@/modules/group/group.repository';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        NotificationMapper,
        { provide: NotificationRepository, useValue: {} },
        { provide: GroupStudentRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
