import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGroup } from '@/database/entities/student-group.entity';
import { GroupStudent } from '@/database/entities/group-student.entity';
import { GroupProject } from '@/database/entities/group-project.entity';
import { ProjectAdvisor } from '@/database/entities/project-advisor.entity';
import { BaseRepository } from '@/shared/repositories/base.repository';

@Injectable()
export class GroupRepository extends BaseRepository<StudentGroup> {
  constructor(@InjectRepository(StudentGroup) repository: Repository<StudentGroup>) {
    super(repository);
  }

  async findByIdWithRelations(id: number): Promise<StudentGroup | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['members', 'projectAssignment'],
    });
  }

  async findByAdvisorId(advisorId: number): Promise<StudentGroup[]> {
    return this.repository
      .createQueryBuilder('student_group')
      .innerJoin('group_project', 'gp', 'gp.group_id = student_group.id')
      .innerJoin('project_advisor', 'pa', 'pa.project_id = gp.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('student_group.deleted_at IS NULL')
      .orderBy('student_group.group_name', 'ASC')
      .getMany();
  }

  async isAdvisorAssignedToGroup(advisorId: number, groupId: number): Promise<boolean> {
    const count = await this.repository.manager
      .createQueryBuilder()
      .select('1')
      .from('project_advisor', 'pa')
      .innerJoin('group_project', 'gp', 'gp.project_id = pa.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('gp.group_id = :groupId', { groupId })
      .getCount();
    return count > 0;
  }
}

@Injectable()
export class GroupStudentRepository {
  constructor(@InjectRepository(GroupStudent) private readonly repository: Repository<GroupStudent>) {}

  async findActiveByStudentId(studentId: number): Promise<GroupStudent | null> {
    return this.repository
      .createQueryBuilder('gs')
      .innerJoin('gs.status', 'status')
      .where('gs.student_id = :studentId', { studentId })
      .andWhere('status.value = :active', { active: 'Active' })
      .getOne();
  }

  async findLeaderByGroupId(groupId: number): Promise<GroupStudent | null> {
    return this.repository.findOne({ where: { groupId, isLeader: true } });
  }

  async findByGroupAndStudent(groupId: number, studentId: number): Promise<GroupStudent | null> {
    return this.repository.findOne({ where: { groupId, studentId } });
  }

  async findByGroupId(groupId: number): Promise<GroupStudent[]> {
    return this.repository.find({ where: { groupId } });
  }

  create(data: Partial<GroupStudent>): GroupStudent {
    return this.repository.create(data);
  }

  async save(entity: GroupStudent): Promise<GroupStudent> {
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

@Injectable()
export class GroupProjectRepository {
  constructor(@InjectRepository(GroupProject) private readonly repository: Repository<GroupProject>) {}

  async findByGroupId(groupId: number): Promise<GroupProject | null> {
    return this.repository.findOne({ where: { groupId } });
  }

  async findByProjectId(projectId: number): Promise<GroupProject | null> {
    return this.repository.findOne({ where: { projectId } });
  }

  create(data: Partial<GroupProject>): GroupProject {
    return this.repository.create(data);
  }

  async save(entity: GroupProject): Promise<GroupProject> {
    return this.repository.save(entity);
  }
}

@Injectable()
export class GroupProjectAdvisorRepository {
  constructor(@InjectRepository(ProjectAdvisor) private readonly repository: Repository<ProjectAdvisor>) {}

  async findByProjectId(projectId: number): Promise<ProjectAdvisor[]> {
    return this.repository.find({ where: { projectId }, order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<ProjectAdvisor | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByProjectAndAdvisor(projectId: number, advisorId: number): Promise<ProjectAdvisor | null> {
    return this.repository.findOne({ where: { projectId, advisorId } });
  }

  async findByProjectAndRole(projectId: number, advisorRoleId: number): Promise<ProjectAdvisor | null> {
    return this.repository.findOne({ where: { projectId, advisorRoleId } });
  }

  create(data: Partial<ProjectAdvisor>): ProjectAdvisor {
    return this.repository.create(data);
  }

  async save(entity: ProjectAdvisor): Promise<ProjectAdvisor> {
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
