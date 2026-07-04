import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from '@/database/entities/evaluation.entity';
import { GroupEvaluation } from '@/database/entities/group-evaluation.entity';
import { ProjectAdvisor } from '@/database/entities/project-advisor.entity';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { StudentModule } from '@/modules/student/student.module';
import { GroupModule } from '@/modules/group/group.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import {
  EvaluationRepository,
  GroupEvaluationRepository,
  ProjectAdvisorLookupRepository,
} from './evaluation.repository';
import { EvaluationMapper } from './evaluation.mapper';
import { EvaluationPolicy } from './evaluation.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation, GroupEvaluation, ProjectAdvisor]),
    AdvisorModule,
    StudentModule,
    GroupModule,
    NotificationModule,
  ],
  controllers: [EvaluationController],
  providers: [
    EvaluationService,
    EvaluationRepository,
    GroupEvaluationRepository,
    ProjectAdvisorLookupRepository,
    EvaluationMapper,
    EvaluationPolicy,
  ],
  exports: [EvaluationService],
})
export class EvaluationModule {}
