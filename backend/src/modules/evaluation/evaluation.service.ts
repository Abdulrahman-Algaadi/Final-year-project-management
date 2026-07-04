import { Injectable } from '@nestjs/common';
import { Evaluation } from '@/database/entities/evaluation.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { AuthenticatedUser, PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { NotificationService } from '@/modules/notification/notification.service';
import { CreateEvaluationDto, CreateGroupEvaluationDto, UpdateGroupEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { EvaluationResponseDto, GroupEvaluationResponseDto } from './dto/evaluation-response.dto';
import {
  EvaluationRepository,
  GroupEvaluationRepository,
  ProjectAdvisorLookupRepository,
} from './evaluation.repository';
import { EvaluationMapper } from './evaluation.mapper';
import { EvaluationPolicy } from './evaluation.policy';
import { EvaluationErrors } from './evaluation.errors';
import { UserRole } from '@/shared/types/enums';

@Injectable()
export class EvaluationService {
  constructor(
    private readonly repository: EvaluationRepository,
    private readonly groupEvaluationRepository: GroupEvaluationRepository,
    private readonly projectAdvisorLookup: ProjectAdvisorLookupRepository,
    private readonly advisorRepository: AdvisorRepository,
    private readonly studentRepository: StudentRepository,
    private readonly groupStudentRepository: GroupStudentRepository,
    private readonly notificationService: NotificationService,
    private readonly mapper: EvaluationMapper,
    private readonly policy: EvaluationPolicy,
  ) {}

  private isPrivileged(user: AuthenticatedUser): boolean {
    return user.role === UserRole.Admin || user.role === UserRole.Coordinator;
  }

  private async assertUserCanAccessGroup(user: AuthenticatedUser, groupId: number): Promise<void> {
    if (this.isPrivileged(user)) return;

    if (user.role === UserRole.Student) {
      const student = await this.studentRepository.findByPersonId(user.personId);
      if (!student) {
        throw DomainException.notFound('Student', user.personId);
      }
      const membership = await this.groupStudentRepository.findByGroupAndStudent(groupId, student.id);
      if (!membership) {
        throw DomainException.forbidden('You do not have access to this group', EvaluationErrors.ADVISOR_NOT_ASSIGNED);
      }
      return;
    }

    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const isAssigned = await this.projectAdvisorLookup.isAdvisorAssignedToGroupProject(advisor.id, groupId);
      this.policy.assertAdvisorAssigned(isAssigned);
      return;
    }

    throw DomainException.forbidden('You do not have access to this group', EvaluationErrors.ADVISOR_NOT_ASSIGNED);
  }

  async findAll(options: QueryOptions): Promise<{ items: EvaluationResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(
      { ...options, sortBy: options.sortBy ?? 'name' },
      'evaluation',
      ['name'],
    );
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findById(id: number): Promise<EvaluationResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Evaluation', id);
    }
    return this.mapper.toResponse(entity);
  }

  private assertCanMutateEvaluation(user: AuthenticatedUser): void {
    if (!this.isPrivileged(user)) {
      throw DomainException.forbidden(
        'Only administrators and coordinators can modify evaluation templates',
        EvaluationErrors.ADVISOR_NOT_ASSIGNED,
      );
    }
  }

  async createForUser(user: AuthenticatedUser, dto: CreateEvaluationDto): Promise<EvaluationResponseDto> {
    this.assertCanMutateEvaluation(user);
    return this.create(dto);
  }

  async updateForUser(
    user: AuthenticatedUser,
    id: number,
    dto: UpdateEvaluationDto,
  ): Promise<EvaluationResponseDto> {
    this.assertCanMutateEvaluation(user);
    return this.update(id, dto);
  }

  async removeForUser(user: AuthenticatedUser, id: number): Promise<void> {
    this.assertCanMutateEvaluation(user);
    return this.remove(id);
  }

  async create(dto: CreateEvaluationDto): Promise<EvaluationResponseDto> {
    const entity = this.repository.create({
      name: dto.name.trim(),
      totalMarks: dto.totalMarks,
      weight: dto.weight,
    } as Evaluation);
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async update(id: number, dto: UpdateEvaluationDto): Promise<EvaluationResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Evaluation', id);
    }
    if (dto.name) entity.name = dto.name.trim();
    if (dto.totalMarks !== undefined) entity.totalMarks = dto.totalMarks;
    if (dto.weight !== undefined) entity.weight = dto.weight;
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Evaluation', id);
    }
    await this.repository.softDelete(id);
  }

  private async resolveAdvisorId(user: AuthenticatedUser): Promise<number> {
    const advisor = await this.advisorRepository.findById(user.personId);
    if (!advisor) {
      throw DomainException.forbidden('User is not an advisor', EvaluationErrors.ADVISOR_NOT_ASSIGNED);
    }
    return advisor.id;
  }

  private async resolveEvaluatorContext(
    user: AuthenticatedUser,
    groupId: number,
  ): Promise<{ advisorId: number; enforceAssignment: boolean }> {
    if (user.role === UserRole.Admin || user.role === UserRole.Coordinator) {
      const advisorId = await this.projectAdvisorLookup.findPrimaryAdvisorForGroup(groupId);
      if (!advisorId) {
        throw DomainException.businessRule(
          'No advisor assigned to this group project',
          EvaluationErrors.ADVISOR_NOT_ASSIGNED,
        );
      }
      return { advisorId, enforceAssignment: false };
    }

    const advisorId = await this.resolveAdvisorId(user);
    return { advisorId, enforceAssignment: true };
  }

  async createGroupEvaluation(
    user: AuthenticatedUser,
    dto: CreateGroupEvaluationDto,
  ): Promise<GroupEvaluationResponseDto> {
    const { advisorId, enforceAssignment } = await this.resolveEvaluatorContext(user, dto.groupId);
    if (enforceAssignment) {
      const isAssigned = await this.projectAdvisorLookup.isAdvisorAssignedToGroupProject(
        advisorId,
        dto.groupId,
      );
      this.policy.assertAdvisorAssigned(isAssigned);
    }

    const evaluation = await this.repository.findById(dto.evaluationId);
    if (!evaluation) {
      throw DomainException.notFound('Evaluation', dto.evaluationId);
    }
    this.policy.assertMarksWithinTotal(dto.obtainedMarks, evaluation);

    const existing = await this.groupEvaluationRepository.findByGroupAndEvaluation(
      dto.groupId,
      dto.evaluationId,
    );
    if (existing) {
      throw DomainException.conflict(
        'Group evaluation already exists',
        EvaluationErrors.DUPLICATE_GROUP_EVALUATION,
      );
    }

    const entity = this.groupEvaluationRepository.create({
      groupId: dto.groupId,
      evaluationId: dto.evaluationId,
      obtainedMarks: dto.obtainedMarks,
      evaluationDate: new Date().toISOString().slice(0, 10),
      evaluatedById: advisorId,
      comments: dto.comments,
      isPublished: false,
    });
    const saved = await this.groupEvaluationRepository.save(entity);
    return this.mapper.toGroupEvaluationResponse(saved);
  }

  async updateGroupEvaluation(
    id: number,
    user: AuthenticatedUser,
    dto: UpdateGroupEvaluationDto,
  ): Promise<GroupEvaluationResponseDto> {
    const entity = await this.groupEvaluationRepository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Group evaluation', id);
    }

    const { advisorId, enforceAssignment } = await this.resolveEvaluatorContext(user, entity.groupId);
    if (enforceAssignment) {
      const isAssigned = await this.projectAdvisorLookup.isAdvisorAssignedToGroupProject(
        advisorId,
        entity.groupId,
      );
      this.policy.assertAdvisorAssigned(isAssigned);
    }

    const wasPublished = entity.isPublished;

    if (dto.obtainedMarks !== undefined && entity.evaluation) {
      this.policy.assertMarksWithinTotal(dto.obtainedMarks, entity.evaluation);
      entity.obtainedMarks = dto.obtainedMarks;
    } else if (dto.obtainedMarks !== undefined) {
      const evaluation = await this.repository.findById(entity.evaluationId);
      if (evaluation) {
        this.policy.assertMarksWithinTotal(dto.obtainedMarks, evaluation);
      }
      entity.obtainedMarks = dto.obtainedMarks;
    }

    if (dto.comments !== undefined) entity.comments = dto.comments;
    if (dto.isPublished !== undefined) entity.isPublished = dto.isPublished;

    const saved = await this.groupEvaluationRepository.save(entity);

    if (dto.isPublished === true && !wasPublished) {
      const evaluationName = saved.evaluation?.name ?? entity.evaluation?.name ?? 'Evaluation';
      await this.notificationService.notifyGroupMembers(
        saved.groupId,
        'Grade published',
        `Your grade for "${evaluationName}" is now available: ${saved.obtainedMarks} marks.`,
      );
    }

    return this.mapper.toGroupEvaluationResponse(saved);
  }

  async findGroupEvaluations(
    user: AuthenticatedUser,
    groupId: number,
  ): Promise<GroupEvaluationResponseDto[]> {
    await this.assertUserCanAccessGroup(user, groupId);

    const items =
      user.role === UserRole.Student
        ? await this.groupEvaluationRepository.findPublishedByGroup(groupId)
        : await this.groupEvaluationRepository.findAllByGroup(groupId);

    return items.map((e) => this.mapper.toGroupEvaluationResponse(e));
  }

  async findAllGradesPaginated(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: GroupEvaluationResponseDto[]; meta: PaginationMeta }> {
    let advisorId: number | undefined;
    if (user.role === UserRole.Advisor) {
      advisorId = await this.resolveAdvisorId(user);
    }

    const { items, meta } = await this.groupEvaluationRepository.findAllPaginated(options, advisorId);
    return { items: items.map((e) => this.mapper.toGroupEvaluationResponse(e)), meta };
  }
}
