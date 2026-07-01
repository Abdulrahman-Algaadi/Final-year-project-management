import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@/database/entities/project.entity';
import { Student } from '@/database/entities/student.entity';
import { GroupEvaluation } from '@/database/entities/group-evaluation.entity';
import { Evaluation } from '@/database/entities/evaluation.entity';
import { Submission } from '@/database/entities/submission.entity';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { ReportingRepository } from './reporting.repository';
import { ReportingMapper } from './reporting.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Student, GroupEvaluation, Evaluation, Submission])],
  controllers: [ReportingController],
  providers: [ReportingService, ReportingRepository, ReportingMapper],
  exports: [ReportingService],
})
export class ReportingModule {}
