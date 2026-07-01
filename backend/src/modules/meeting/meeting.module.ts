import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from '@/database/entities/meeting.entity';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { StudentModule } from '@/modules/student/student.module';
import { GroupModule } from '@/modules/group/group.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { MeetingRepository } from './meeting.repository';
import { MeetingMapper } from './meeting.mapper';
import { MeetingPolicy } from './meeting.policy';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting]), AdvisorModule, StudentModule, GroupModule, NotificationModule, AuditModule],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingRepository, MeetingMapper, MeetingPolicy],
  exports: [MeetingService],
})
export class MeetingModule {}
