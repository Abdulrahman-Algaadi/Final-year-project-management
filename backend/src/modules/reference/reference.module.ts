import { Module } from '@nestjs/common';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { DepartmentModule } from '@/modules/department/department.module';
import { EvaluationModule } from '@/modules/evaluation/evaluation.module';
import { GroupModule } from '@/modules/group/group.module';
import { ProjectModule } from '@/modules/project/project.module';
import { SemesterModule } from '@/modules/semester/semester.module';
import { StudentModule } from '@/modules/student/student.module';
import { ReferenceController } from './reference.controller';
import { ReferenceService } from './reference.service';

@Module({
  imports: [
    DepartmentModule,
    SemesterModule,
    StudentModule,
    ProjectModule,
    GroupModule,
    EvaluationModule,
    AdvisorModule,
  ],
  controllers: [ReferenceController],
  providers: [ReferenceService],
  exports: [ReferenceService],
})
export class ReferenceModule {}
