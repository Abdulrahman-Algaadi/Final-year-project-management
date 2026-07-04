import { Injectable } from '@nestjs/common';
import { Project } from '@/database/entities/project.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { UserRole } from '@/shared/types/enums';
import { PaginationMeta, QueryOptions, AuthenticatedUser } from '@/shared/types/common.types';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { buildPaginationMeta } from '@/shared/utils/query.util';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { ProjectRepository, ProjectStatusRepository } from './project.repository';
import { ProjectMapper } from './project.mapper';
import { ProjectPolicy } from './project.policy';
import { ProjectErrors } from './project.errors';

@Injectable()
export class ProjectService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly statusRepository: ProjectStatusRepository,
    private readonly mapper: ProjectMapper,
    private readonly policy: ProjectPolicy,
    private readonly advisorRepository: AdvisorRepository,
    private readonly studentRepository: StudentRepository,
    private readonly groupStudentRepository: GroupStudentRepository,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: ProjectResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAllWithDepartment({
      ...options,
      sortBy: options.sortBy ?? 'createdAt',
    });
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findAllForUser(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: ProjectResponseDto[]; meta: PaginationMeta }> {
    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const { items, meta } = await this.repository.findAllForAdvisor(advisor.id, {
        ...options,
        sortBy: options.sortBy ?? 'createdAt',
      });
      return { items: this.mapper.toResponseList(items), meta };
    }

    if (user.role === UserRole.Student) {
      return this.findAllForStudent(user, options);
    }

    return this.findAll(options);
  }

  private async findAllForStudent(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: ProjectResponseDto[]; meta: PaginationMeta }> {
    const student = await this.studentRepository.findByPersonId(user.personId);
    if (!student) {
      throw DomainException.notFound('Student', user.personId);
    }
    const membership = await this.groupStudentRepository.findActiveByStudentId(student.id);
    if (!membership) {
      return { items: [], meta: buildPaginationMeta(0, options) };
    }
    const project = await this.repository.findByGroupId(membership.groupId);
    if (!project) {
      return { items: [], meta: buildPaginationMeta(0, options) };
    }
    if (options.search && !project.title.toLowerCase().includes(options.search.toLowerCase())) {
      return { items: [], meta: buildPaginationMeta(0, options) };
    }
    const dto = this.mapper.toResponse(project);
    return { items: [dto], meta: buildPaginationMeta(1, { ...options, page: 1, limit: options.limit ?? 20 }) };
  }

  async findById(id: number): Promise<ProjectResponseDto> {
    const entity = await this.repository.findByIdWithRelations(id);
    if (!entity) {
      throw DomainException.notFound('Project', id);
    }
    return this.mapper.toResponse(entity);
  }

  async findByIdForUser(user: AuthenticatedUser, id: number): Promise<ProjectResponseDto> {
    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const isAssigned = await this.repository.isAdvisorAssignedToProject(advisor.id, id);
      if (!isAssigned) {
        throw DomainException.forbidden('You do not have access to this project', ProjectErrors.ACCESS_DENIED);
      }
    }

    if (user.role === UserRole.Student) {
      const student = await this.studentRepository.findByPersonId(user.personId);
      if (!student) {
        throw DomainException.notFound('Student', user.personId);
      }
      const membership = await this.groupStudentRepository.findActiveByStudentId(student.id);
      if (!membership) {
        throw DomainException.forbidden('You do not have access to this project', ProjectErrors.ACCESS_DENIED);
      }
      const project = await this.repository.findByGroupId(membership.groupId);
      if (!project || project.id !== id) {
        throw DomainException.forbidden('You do not have access to this project', ProjectErrors.ACCESS_DENIED);
      }
    }

    return this.findById(id);
  }

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const entity = this.repository.create({
      title: dto.title.trim(),
      description: dto.description,
      semesterId: dto.semesterId,
      statusId: dto.statusId,
      createdAt: new Date(),
    } as Project);
    const saved = await this.repository.save(entity);
    return this.findById(saved.id);
  }

  async updateForUser(
    user: AuthenticatedUser,
    id: number,
    dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    if (user.role === UserRole.Advisor) {
      await this.findByIdForUser(user, id);
    }
    return this.update(id, dto);
  }

  async removeForUser(user: AuthenticatedUser, id: number): Promise<void> {
    if (user.role === UserRole.Advisor) {
      await this.findByIdForUser(user, id);
    }
    return this.remove(id);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const entity = await this.repository.findByIdWithRelations(id);
    if (!entity) {
      throw DomainException.notFound('Project', id);
    }
    this.policy.assertWritable(entity.status?.statusName);

    if (dto.title) entity.title = dto.title.trim();
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.semesterId !== undefined) entity.semesterId = dto.semesterId;
    if (dto.statusId !== undefined) entity.statusId = dto.statusId;

    await this.repository.save(entity);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findByIdWithRelations(id);
    if (!entity) {
      throw DomainException.notFound('Project', id);
    }
    this.policy.assertWritable(entity.status?.statusName);
    await this.repository.softDelete(id);
  }

  async assertProjectWritable(projectId: number): Promise<void> {
    const entity = await this.repository.findByIdWithRelations(projectId);
    if (!entity) {
      throw DomainException.notFound('Project', projectId);
    }
    this.policy.assertWritable(entity.status?.statusName);
  }

  async assertGroupProjectWritable(groupId: number): Promise<void> {
    const project = await this.repository.findByGroupId(groupId);
    if (project) {
      this.policy.assertWritable(project.status?.statusName);
    }
  }

  async isProjectReadOnlyByGroupId(groupId: number): Promise<boolean> {
    const project = await this.repository.findByGroupId(groupId);
    if (!project) return false;
    return this.policy.isReadOnly(project.status?.statusName);
  }
}
