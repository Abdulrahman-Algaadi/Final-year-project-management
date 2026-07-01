import { Injectable } from '@nestjs/common';
import { Meeting } from '@/database/entities/meeting.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { MeetingStatus, UserRole, AuditActionType } from '@/shared/types/enums';
import { PaginationMeta, QueryOptions, AuthenticatedUser } from '@/shared/types/common.types';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { StudentRepository } from '@/modules/student/student.repository';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { NotificationService } from '@/modules/notification/notification.service';
import { AuditService } from '@/modules/audit/audit.service';import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingResponseDto } from './dto/meeting-response.dto';
import { MeetingRepository } from './meeting.repository';
import { MeetingMapper } from './meeting.mapper';
import { MeetingPolicy } from './meeting.policy';

@Injectable()
export class MeetingService {
  constructor(
    private readonly repository: MeetingRepository,
    private readonly mapper: MeetingMapper,
    private readonly policy: MeetingPolicy,
    private readonly advisorRepository: AdvisorRepository,
    private readonly studentRepository: StudentRepository,
    private readonly groupStudentRepository: GroupStudentRepository,
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

  private async assertUserCanAccessMeeting(user: AuthenticatedUser, meeting: Meeting): Promise<void> {
    if (this.isPrivileged(user)) return;

    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const ownsMeeting = meeting.advisorId === advisor.id;
      const isAssigned = await this.repository.isAdvisorAssignedToGroup(advisor.id, meeting.groupId);
      this.policy.assertCanAccess(ownsMeeting || isAssigned);
      return;
    }

    if (user.role === UserRole.Student) {
      const student = await this.studentRepository.findByPersonId(user.personId);
      if (!student) {
        throw DomainException.notFound('Student', user.personId);
      }
      const membership = await this.groupStudentRepository.findByGroupAndStudent(meeting.groupId, student.id);
      this.policy.assertCanAccess(!!membership);
      return;
    }

    this.policy.assertCanAccess(false);
  }

  async findAll(options: QueryOptions): Promise<{ items: MeetingResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(
      { ...options, sortBy: options.sortBy ?? 'meetingDate' },
      'meeting',
      ['location', 'notes'],
    );
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findAllForUser(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: MeetingResponseDto[]; meta: PaginationMeta }> {
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

  async findById(user: AuthenticatedUser, id: number): Promise<MeetingResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Meeting', id);
    }
    await this.assertUserCanAccessMeeting(user, entity);
    return this.mapper.toResponse(entity);
  }

  async findByGroup(user: AuthenticatedUser, groupId: number): Promise<MeetingResponseDto[]> {
    await this.assertUserCanAccessGroup(user, groupId);
    const items = await this.repository.findByGroupId(groupId);
    return this.mapper.toResponseList(items);
  }

  async create(user: AuthenticatedUser, dto: CreateMeetingDto): Promise<MeetingResponseDto> {
    await this.assertUserCanAccessGroup(user, dto.groupId);

    let advisorId = dto.advisorId;
    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      advisorId = advisor.id;
    }

    this.policy.assertNotInPast(dto.meetingDate);

    const entity = this.repository.create({
      groupId: dto.groupId,
      advisorId,
      meetingDate: new Date(dto.meetingDate),
      location: dto.location?.trim(),
      notes: dto.notes,
      onlineLink: dto.onlineLink,
      status: MeetingStatus.Scheduled,
    } as Meeting);

    const saved = await this.repository.save(entity);

    await this.auditService.log({
      tableName: 'meeting',
      recordId: saved.id,
      actionType: AuditActionType.Insert,
      performedById: user.personId,
    });
    await this.notificationService.notifyGroupMembers(
      dto.groupId,
      'Meeting scheduled',
      `A new meeting has been scheduled for ${saved.meetingDate.toISOString()}.`,
    );

    return this.mapper.toResponse(saved);
  }

  async update(user: AuthenticatedUser, id: number, dto: UpdateMeetingDto): Promise<MeetingResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Meeting', id);
    }
    await this.assertUserCanAccessMeeting(user, entity);

    if (dto.meetingDate) {
      this.policy.assertNotInPast(dto.meetingDate);
      entity.meetingDate = new Date(dto.meetingDate);
    }
    if (dto.groupId !== undefined) entity.groupId = dto.groupId;
    if (dto.advisorId !== undefined) entity.advisorId = dto.advisorId;
    if (dto.location !== undefined) entity.location = dto.location?.trim();
    if (dto.notes !== undefined) entity.notes = dto.notes;
    if (dto.onlineLink !== undefined) entity.onlineLink = dto.onlineLink;

    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async remove(user: AuthenticatedUser, id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Meeting', id);
    }
    await this.assertUserCanAccessMeeting(user, entity);
    await this.repository.softDelete(id);
  }
}
