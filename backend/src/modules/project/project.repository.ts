import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '@/database/entities/project.entity';
import { ProjectStatus } from '@/database/entities/department.entity';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { BaseRepository } from '@/shared/repositories/base.repository';
import { applySoftDeleteFilter } from '@/shared/utils/query.util';
import { paginateQuery } from '@/shared/utils/repository.util';

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
  constructor(@InjectRepository(Project) repository: Repository<Project>) {
    super(repository);
  }

  async findAllWithDepartment(
    options: QueryOptions,
  ): Promise<{ items: Project[]; meta: PaginationMeta }> {
    const qb = this.repository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.status', 'status')
      .leftJoinAndSelect('project.semester', 'semester')
      .leftJoinAndSelect('project.groupAssignment', 'groupAssignment')
      .leftJoinAndSelect('groupAssignment.group', 'group')
      .leftJoinAndSelect('group.members', 'members')
      .leftJoinAndSelect('members.student', 'student')
      .leftJoinAndSelect('student.department', 'department');

    applySoftDeleteFilter(qb, 'project', options.includeDeleted);

    if (options.search) {
      qb.andWhere('project.title ILIKE :search', { search: `%${options.search}%` });
    }

    return paginateQuery(
      qb,
      'project',
      { ...options, sortBy: options.sortBy ?? 'createdAt' },
      'createdAt',
    );
  }

  async findAllForAdvisor(
    advisorId: number,
    options: QueryOptions,
  ): Promise<{ items: Project[]; meta: PaginationMeta }> {
    const qb = this.repository
      .createQueryBuilder('project')
      .innerJoin('project_advisor', 'pa', 'pa.project_id = project.id')
      .leftJoinAndSelect('project.status', 'status')
      .leftJoinAndSelect('project.semester', 'semester')
      .leftJoinAndSelect('project.groupAssignment', 'groupAssignment')
      .leftJoinAndSelect('groupAssignment.group', 'group')
      .where('pa.advisor_id = :advisorId', { advisorId });

    applySoftDeleteFilter(qb, 'project', options.includeDeleted);

    if (options.search) {
      qb.andWhere('project.title ILIKE :search', { search: `%${options.search}%` });
    }

    return paginateQuery(
      qb,
      'project',
      { ...options, sortBy: options.sortBy ?? 'createdAt' },
      'createdAt',
    );
  }

  async findByIdWithRelations(id: number): Promise<Project | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'semester',
        'status',
        'groupAssignment',
        'groupAssignment.group',
        'groupAssignment.group.members',
        'groupAssignment.group.members.student',
        'groupAssignment.group.members.student.department',
        'advisors',
      ],
    });
  }

  async findByGroupId(groupId: number): Promise<Project | null> {
    return this.repository
      .createQueryBuilder('project')
      .innerJoin('group_project', 'gp', 'gp.project_id = project.id')
      .leftJoinAndSelect('project.status', 'status')
      .where('gp.group_id = :groupId', { groupId })
      .getOne();
  }

  async isAdvisorAssignedToProject(advisorId: number, projectId: number): Promise<boolean> {
    const count = await this.repository.manager
      .createQueryBuilder()
      .select('1')
      .from('project_advisor', 'pa')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('pa.project_id = :projectId', { projectId })
      .getCount();
    return count > 0;
  }
}

@Injectable()
export class ProjectStatusRepository {
  constructor(@InjectRepository(ProjectStatus) private readonly repository: Repository<ProjectStatus>) {}

  async findById(id: number): Promise<ProjectStatus | null> {
    return this.repository.findOne({ where: { id } });
  }
}
