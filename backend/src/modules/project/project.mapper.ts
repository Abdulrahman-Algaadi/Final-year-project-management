import { Project } from '@/database/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectMapper {
  private resolveDepartment(entity: Project): { departmentId?: number; departmentName?: string } {
    const members = entity.groupAssignment?.group?.members;
    if (!members?.length) return {};
    const leader = members.find((m) => m.isLeader) ?? members[0];
    const department = leader?.student?.department;
    if (!department) return {};
    return { departmentId: department.id, departmentName: department.name };
  }

  toResponse(entity: Project): ProjectResponseDto {
    const department = this.resolveDepartment(entity);
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      semesterId: entity.semesterId,
      semesterName: entity.semester?.name,
      statusId: entity.statusId,
      statusName: entity.status?.statusName,
      ...department,
      createdAt: entity.createdAt,
    };
  }

  toResponseList(entities: Project[]): ProjectResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
