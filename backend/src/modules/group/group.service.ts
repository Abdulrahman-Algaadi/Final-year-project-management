import { Injectable } from '@nestjs/common';
import { StudentGroup } from '@/database/entities/student-group.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { AuthenticatedUser, PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { CreateGroupDto, AddGroupMemberDto, AssignGroupProjectDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { GroupRepository, GroupStudentRepository, GroupProjectRepository } from './group.repository';
import { GroupMapper } from './group.mapper';
import { GroupPolicy } from './group.policy';
import { GroupErrors } from './group.errors';
import { StudentRepository } from '@/modules/student/student.repository';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { UserRole, LookupCategory } from '@/shared/types/enums';
import { buildPaginationMeta } from '@/shared/utils/query.util';
import { LookupRepository } from '@/modules/lookup/lookup.repository';

@Injectable()
export class GroupService {
  constructor(
    private readonly repository: GroupRepository,
    private readonly groupStudentRepository: GroupStudentRepository,
    private readonly groupProjectRepository: GroupProjectRepository,
    private readonly studentRepository: StudentRepository,
    private readonly advisorRepository: AdvisorRepository,
    private readonly lookupRepository: LookupRepository,
    private readonly mapper: GroupMapper,
    private readonly policy: GroupPolicy,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: GroupResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(
      { ...options, sortBy: options.sortBy ?? 'createdOn' },
      'student_group',
      ['groupName'],
      ['members', 'projectAssignment'],
    );
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findAllForUser(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: GroupResponseDto[]; meta: PaginationMeta }> {
    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      let groups = await this.repository.findByAdvisorId(advisor.id);
      if (options.search) {
        const q = options.search.toLowerCase();
        groups = groups.filter((g) => g.groupName.toLowerCase().includes(q));
      }
      const page = options.page ?? 1;
      const limit = options.limit ?? 20;
      const start = (page - 1) * limit;
      const slice = groups.slice(start, start + limit);
      return {
        items: this.mapper.toResponseList(slice),
        meta: buildPaginationMeta(groups.length, options),
      };
    }

    return this.findAll(options);
  }

  async findById(id: number): Promise<GroupResponseDto> {
    const entity = await this.repository.findByIdWithRelations(id);
    if (!entity) {
      throw DomainException.notFound('Group', id);
    }
    return this.mapper.toResponse(entity);
  }

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
        throw DomainException.forbidden('You do not have access to this group', GroupErrors.ACCESS_DENIED);
      }
      return;
    }

    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const isAssigned = await this.repository.isAdvisorAssignedToGroup(advisor.id, groupId);
      if (!isAssigned) {
        throw DomainException.forbidden('You do not have access to this group', GroupErrors.ACCESS_DENIED);
      }
      return;
    }

    throw DomainException.forbidden('You do not have access to this group', GroupErrors.ACCESS_DENIED);
  }

  async findByIdForUser(user: AuthenticatedUser, id: number): Promise<GroupResponseDto> {
    await this.assertUserCanAccessGroup(user, id);
    return this.findById(id);
  }

  async findOwn(user: AuthenticatedUser): Promise<GroupResponseDto> {
    const student = await this.studentRepository.findByPersonId(user.personId);
    if (!student) {
      throw DomainException.notFound('Student', user.personId);
    }
    const membership = await this.groupStudentRepository.findActiveByStudentId(student.id);
    if (!membership) {
      throw DomainException.notFound('Group membership');
    }
    return this.findById(membership.groupId);
  }

  async findAssignedToAdvisor(user: AuthenticatedUser): Promise<GroupResponseDto[]> {
    if (user.role !== UserRole.Advisor) {
      throw DomainException.forbidden('Only advisors can access assigned groups');
    }
    const advisor = await this.advisorRepository.findById(user.personId);
    if (!advisor) {
      throw DomainException.notFound('Advisor', user.personId);
    }
    const groups = await this.repository.findByAdvisorId(advisor.id);
    return this.mapper.toResponseList(groups);
  }

  private assertCanMutateGroup(user: AuthenticatedUser): void {
    if (!this.isPrivileged(user)) {
      throw DomainException.forbidden(
        'Only administrators and coordinators can modify groups',
        GroupErrors.ACCESS_DENIED,
      );
    }
  }

  async createForUser(user: AuthenticatedUser, dto: CreateGroupDto): Promise<GroupResponseDto> {
    this.assertCanMutateGroup(user);
    return this.create(dto);
  }

  async updateForUser(
    user: AuthenticatedUser,
    id: number,
    dto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    this.assertCanMutateGroup(user);
    return this.update(id, dto);
  }

  async removeForUser(user: AuthenticatedUser, id: number): Promise<void> {
    this.assertCanMutateGroup(user);
    return this.remove(id);
  }

  async addMemberForUser(
    user: AuthenticatedUser,
    groupId: number,
    dto: AddGroupMemberDto,
  ): Promise<GroupResponseDto> {
    this.assertCanMutateGroup(user);
    return this.addMember(groupId, dto);
  }

  async removeMemberForUser(
    user: AuthenticatedUser,
    groupId: number,
    memberId: number,
  ): Promise<GroupResponseDto> {
    this.assertCanMutateGroup(user);
    return this.removeMember(groupId, memberId);
  }

  async assignProjectForUser(
    user: AuthenticatedUser,
    groupId: number,
    dto: AssignGroupProjectDto,
  ): Promise<GroupResponseDto> {
    this.assertCanMutateGroup(user);
    return this.assignProject(groupId, dto);
  }

  async create(dto: CreateGroupDto): Promise<GroupResponseDto> {
    const entity = this.repository.create({
      groupName: dto.groupName.trim(),
      createdOn: new Date(),
    } as StudentGroup);
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async update(id: number, dto: UpdateGroupDto): Promise<GroupResponseDto> {
    const entity = await this.repository.findByIdWithRelations(id);
    if (!entity) {
      throw DomainException.notFound('Group', id);
    }
    if (dto.groupName) entity.groupName = dto.groupName.trim();
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Group', id);
    }
    await this.repository.softDelete(id);
  }

  async addMember(groupId: number, dto: AddGroupMemberDto): Promise<GroupResponseDto> {
    const group = await this.repository.findByIdWithRelations(groupId);
    if (!group) {
      throw DomainException.notFound('Group', groupId);
    }

    const activeMembership = await this.groupStudentRepository.findActiveByStudentId(dto.studentId);
    this.policy.assertSingleActiveGroup(activeMembership);

    if (dto.isLeader) {
      const existingLeader = await this.groupStudentRepository.findLeaderByGroupId(groupId);
      this.policy.assertLeaderUnique(existingLeader, true);
    }

    const statusId = await this.resolveMemberStatusId(dto.statusId);

    const member = this.groupStudentRepository.create({
      groupId,
      studentId: dto.studentId,
      statusId,
      isLeader: dto.isLeader ?? false,
      assignmentDate: new Date().toISOString().slice(0, 10),
    });
    await this.groupStudentRepository.save(member);
    return this.findById(groupId);
  }

  private async resolveMemberStatusId(statusId?: number): Promise<number> {
    if (statusId !== undefined) {
      const lookup = await this.lookupRepository.findById(statusId);
      if (!lookup || lookup.category !== LookupCategory.StudentStatus) {
        throw DomainException.badRequest('Invalid student status', GroupErrors.INVALID_STATUS);
      }
      return statusId;
    }

    const active = await this.lookupRepository.findByCategoryAndValue(
      LookupCategory.StudentStatus,
      'Active',
    );
    if (!active) {
      throw DomainException.notFound('StudentStatus Active lookup');
    }
    return active.id;
  }

  async removeMember(groupId: number, memberId: number): Promise<GroupResponseDto> {
    await this.groupStudentRepository.delete(memberId);
    return this.findById(groupId);
  }

  async assignProject(groupId: number, dto: AssignGroupProjectDto): Promise<GroupResponseDto> {
    const group = await this.repository.findByIdWithRelations(groupId);
    if (!group) {
      throw DomainException.notFound('Group', groupId);
    }

    const existingGroupProject = await this.groupProjectRepository.findByGroupId(groupId);
    if (existingGroupProject) {
      throw DomainException.businessRule(
        'Group already has a project assigned',
        GroupErrors.GROUP_ALREADY_HAS_PROJECT,
      );
    }

    const existingProjectAssignment = await this.groupProjectRepository.findByProjectId(dto.projectId);
    if (existingProjectAssignment) {
      throw DomainException.businessRule(
        'Project is already assigned to another group',
        GroupErrors.PROJECT_ALREADY_ASSIGNED,
      );
    }

    const assignment = this.groupProjectRepository.create({
      groupId,
      projectId: dto.projectId,
      assignedDate: new Date().toISOString().slice(0, 10),
    });
    await this.groupProjectRepository.save(assignment);
    return this.findById(groupId);
  }
}
