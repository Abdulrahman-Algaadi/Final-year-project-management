import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentGroup } from '@/database/entities/student-group.entity';
import { GroupStudent } from '@/database/entities/group-student.entity';
import { GroupProject } from '@/database/entities/group-project.entity';
import { LookupModule } from '@/modules/lookup/lookup.module';
import { StudentModule } from '@/modules/student/student.module';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupRepository, GroupStudentRepository, GroupProjectRepository } from './group.repository';
import { GroupMapper } from './group.mapper';
import { GroupPolicy } from './group.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentGroup, GroupStudent, GroupProject]),
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
    GroupMapper,
    GroupPolicy,
  ],
  exports: [GroupService, GroupRepository, GroupStudentRepository, GroupProjectRepository],
})
export class GroupModule {}
