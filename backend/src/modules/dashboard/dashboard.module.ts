import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@/database/entities/project.entity';
import { StudentGroup } from '@/database/entities/student-group.entity';
import { Student } from '@/database/entities/student.entity';
import { Submission } from '@/database/entities/submission.entity';
import { Meeting } from '@/database/entities/meeting.entity';
import { Notification } from '@/database/entities/notification.entity';
import { Advisor } from '@/database/entities/advisor.entity';
import { Department } from '@/database/entities/department.entity';
import { ProjectAdvisor } from '@/database/entities/project-advisor.entity';
import { GroupStudent } from '@/database/entities/group-student.entity';
import { GroupProject } from '@/database/entities/group-project.entity';
import { GroupEvaluation } from '@/database/entities/group-evaluation.entity';
import { StudentModule } from '@/modules/student/student.module';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      StudentGroup,
      Student,
      Submission,
      Meeting,
      Notification,
      Advisor,
      Department,
      ProjectAdvisor,
      GroupStudent,
      GroupProject,
      GroupEvaluation,
    ]),
    StudentModule,
    AdvisorModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
  exports: [DashboardService],
})
export class DashboardModule {}
