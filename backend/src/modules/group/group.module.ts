import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentGroup } from '@/database/entities/student-group.entity';
import { GroupStudent } from '@/database/entities/group-student.entity';
import { GroupProject } from '@/database/entities/group-project.entity';
import { ProjectAdvisor } from '@/database/entities/project-advisor.entity';
import { LookupModule } from '@/modules/lookup/lookup.module';
import { StudentModule } from '@/modules/student/student.module';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupRepository, GroupStudentRepository, GroupProjectRepository, GroupProjectAdvisorRepository } from './group.repository';
import { GroupMapper } from './group.mapper';
import { GroupPolicy } from './group.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentGroup, GroupStudent, GroupProject, ProjectAdvisor]),
    LookupModule,
    StudentModule,
    AdvisorModule,
  ],
  controllers: [GroupController],
  providers: [
    GroupService,
    GroupRepository,
    GroupStudentRepository,
    GroupProjectRepository,
    GroupProjectAdvisorRepository,
    GroupMapper,
    GroupPolicy,
  ],
  exports: [GroupService, GroupRepository, GroupStudentRepository, GroupProjectRepository, GroupProjectAdvisorRepository],
})
export class GroupModule {}
