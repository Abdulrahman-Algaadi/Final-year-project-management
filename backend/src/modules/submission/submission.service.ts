import { Injectable } from '@nestjs/common';
import { Submission } from '@/database/entities/submission.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { SubmissionStatus, UserRole, AuditActionType } from '@/shared/types/enums';
import { PaginationMeta, QueryOptions, AuthenticatedUser } from '@/shared/types/common.types';
import { SupabaseService } from '@/shared/services/supabase.service';
import { ProjectService } from '@/modules/project/project.service';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { NotificationService } from '@/modules/notification/notification.service';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateSubmissionDto, ReviewSubmissionDto } from './dto/create-submission.dto';
import {
  SubmissionDownloadResponseDto,
  SubmissionUploadResponseDto,
} from './dto/submission-download.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { SubmissionRepository } from './submission.repository';
import { SubmissionMapper } from './submission.mapper';
import { SubmissionPolicy } from './submission.policy';
import { SubmissionErrors } from './submission.errors';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly repository: SubmissionRepository,
    private readonly projectService: ProjectService,
    private readonly advisorRepository: AdvisorRepository,
    private readonly studentRepository: StudentRepository,
    private readonly groupStudentRepository: GroupStudentRepository,
    private readonly mapper: SubmissionMapper,
    private readonly policy: SubmissionPolicy,
    private readonly supabase: SupabaseService,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
  ) {}

  private isPrivileged(user: AuthenticatedUser): boolean {
    return user.role === UserRole.Admin || user.role === UserRole.Coordinator;
  }

  private async resolveStudentGroupId(user: AuthenticatedUser): Promise<number | null> {
    const student = await this.studentRepository.findByPersonId(user.personId);
    if (!student) return null;
    const membership = await this.groupStudentRepository.findActiveByStudentId(student.id);
    return membership?.groupId ?? null;
  }

  private async assertUserCanAccessGroup(user: AuthenticatedUser, groupId: number): Promise<void> {
    if (this.isPrivileged(user)) return;

    if (user.role === UserRole.Student) {
      const student = await this.studentRepository.findByPersonId(user.personId);
      if (!student) {
        throw DomainException.notFound('Student', user.personId);
      }
      const membership = await this.groupStudentRepository.findByGroupAndStudent(groupId, student.id);
      this.policy.assertCanAccess(!!membership);
      return;
    }

    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const isAssigned = await this.repository.isAdvisorAssignedToGroup(advisor.id, groupId);
      this.policy.assertCanAccess(isAssigned);
      return;
    }

    this.policy.assertCanAccess(false);
  }

  private async assertUserCanAccessSubmission(user: AuthenticatedUser, submission: Submission): Promise<void> {
    await this.assertUserCanAccessGroup(user, submission.groupId);
  }

  private async assertSubmissionsAllowed(groupId: number): Promise<void> {
    const readOnly = await this.projectService.isProjectReadOnlyByGroupId(groupId);
    if (readOnly) {
      throw DomainException.businessRule(
        'Submissions are read-only for archived or completed projects',
        SubmissionErrors.PROJECT_READ_ONLY,
      );
    }
  }

  async findAll(options: QueryOptions): Promise<{ items: SubmissionResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(
      { ...options, sortBy: options.sortBy ?? 'submittedAt' },
      'submission',
      ['title'],
    );
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findAllForUser(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: SubmissionResponseDto[]; meta: PaginationMeta }> {
    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const { items, meta } = await this.repository.findAllForAdvisor(advisor.id, options);
      return { items: this.mapper.toResponseList(items), meta };
    }

    if (user.role === UserRole.Student) {
      const groupId = await this.resolveStudentGroupId(user);
      if (!groupId) {
        return { items: [], meta: { page: options.page ?? 1, limit: options.limit ?? 20, total: 0, totalPages: 0 } };
      }
      const { items, meta } = await this.repository.findAllForGroup(groupId, options);
      return { items: this.mapper.toResponseList(items), meta };
    }

    return this.findAll(options);
  }

  async findById(user: AuthenticatedUser, id: number): Promise<SubmissionResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Submission', id);
    }
    await this.assertUserCanAccessSubmission(user, entity);
    return this.mapper.toResponse(entity);
  }

  async findByGroup(user: AuthenticatedUser, groupId: number): Promise<SubmissionResponseDto[]> {
    await this.assertUserCanAccessGroup(user, groupId);
    const items = await this.repository.findByGroupId(groupId);
    return this.mapper.toResponseList(items);
  }

  async create(user: AuthenticatedUser, dto: CreateSubmissionDto): Promise<SubmissionResponseDto> {
    await this.assertUserCanAccessGroup(user, dto.groupId);
    await this.assertSubmissionsAllowed(dto.groupId);

    const latest = await this.repository.findLatestVersion(dto.groupId);
    const versionNo = (latest?.versionNo ?? 0) + 1;

    const entity = this.repository.create({
      groupId: dto.groupId,
      title: dto.title.trim(),
      filePath: dto.filePath.trim(),
      versionNo,
      submittedAt: new Date(),
      submissionType: dto.submissionType,
      status: SubmissionStatus.Pending,
      storageBucket: dto.storageBucket ?? this.supabase.getStorageBucket(),
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
    } as Submission);

    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async review(user: AuthenticatedUser, id: number, dto: ReviewSubmissionDto): Promise<SubmissionResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Submission', id);
    }
    if (!this.isPrivileged(user)) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.forbidden('Only assigned advisors can review submissions', SubmissionErrors.ACCESS_DENIED);
      }
      const isAssigned = await this.repository.isAdvisorAssignedToGroup(advisor.id, entity.groupId);
      this.policy.assertCanAccess(isAssigned);
    }

    entity.status = dto.status;
    entity.reviewedAt = new Date();
    const saved = await this.repository.save(entity);

    await this.auditService.log({
      tableName: 'submission',
      recordId: saved.id,
      actionType: AuditActionType.Update,
      performedById: user.userAccountId,
    });
    await this.notificationService.notifyGroupMembers(
      entity.groupId,
      'Submission reviewed',
      `Your submission "${entity.title}" was marked as ${dto.status}.`,
    );

    return this.mapper.toResponse(saved);
  }

  async remove(user: AuthenticatedUser, id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Submission', id);
    }
    await this.assertUserCanAccessSubmission(user, entity);
    await this.assertSubmissionsAllowed(entity.groupId);
    await this.repository.softDelete(id);
  }

  async uploadFile(
    user: AuthenticatedUser,
    groupId: number,
    file: Express.Multer.File,
  ): Promise<SubmissionUploadResponseDto> {
    await this.assertUserCanAccessGroup(user, groupId);
    await this.assertSubmissionsAllowed(groupId);

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${groupId}/${Date.now()}-${safeName}`;
    const bucket = this.supabase.getStorageBucket();
    const uploaded = await this.supabase.uploadFile(path, file.buffer, file.mimetype);

    return {
      path: uploaded.path,
      size: uploaded.size,
      mimeType: file.mimetype,
      storageBucket: bucket,
    };
  }

  async getDownloadUrl(user: AuthenticatedUser, id: number): Promise<SubmissionDownloadResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Submission', id);
    }
    await this.assertUserCanAccessSubmission(user, entity);

    const url = await this.supabase.createSignedUrl(entity.filePath);
    const fileName = entity.filePath.split('/').pop() ?? entity.filePath;

    return { url, fileName };
  }
}
