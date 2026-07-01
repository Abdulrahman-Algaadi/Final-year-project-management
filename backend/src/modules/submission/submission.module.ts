import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from '@/database/entities/submission.entity';
import { ProjectModule } from '@/modules/project/project.module';
import { StudentModule } from '@/modules/student/student.module';
import { GroupModule } from '@/modules/group/group.module';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { SharedModule } from '@/shared/shared.module';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './submission.repository';
import { SubmissionMapper } from './submission.mapper';
import { SubmissionPolicy } from './submission.policy';

@Module({
  imports: [TypeOrmModule.forFeature([Submission]), ProjectModule, AdvisorModule, StudentModule, GroupModule, NotificationModule, AuditModule, SharedModule],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionRepository, SubmissionMapper, SubmissionPolicy],
  exports: [SubmissionService],
})
export class SubmissionModule {}
