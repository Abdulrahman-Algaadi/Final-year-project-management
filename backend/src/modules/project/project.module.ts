import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@/database/entities/project.entity';
import { ProjectStatus } from '@/database/entities/department.entity';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { StudentModule } from '@/modules/student/student.module';
import { GroupModule } from '@/modules/group/group.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository, ProjectStatusRepository } from './project.repository';
import { ProjectMapper } from './project.mapper';
import { ProjectPolicy } from './project.policy';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectStatus]), AdvisorModule, StudentModule, GroupModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, ProjectStatusRepository, ProjectMapper, ProjectPolicy],
  exports: [ProjectService, ProjectRepository, ProjectPolicy],
})
export class ProjectModule {}
