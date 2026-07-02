import { Project } from '@/database/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectMapper {
  private resolveDepartment(entity: Project): { departmentId?: number; departmentName?: string } {
    const members = entity.groupAssignment?.group?.members;
    if (members?.length) {
      const leader = members.find((m) => m.isLeader) ?? members[0];
      const department = leader?.student?.department;
      if (department) {
        return { departmentId: department.id, departmentName: department.name };
      }
      for (const member of members) {
        const memberDepartment = member.student?.department;
        if (memberDepartment) {
          return { departmentId: memberDepartment.id, departmentName: memberDepartment.name };
        }
      }
    }

    const advisorAssignment = entity.advisors?.[0];
    const advisorDepartment = advisorAssignment?.advisor?.department;
    if (advisorDepartment) {
      return { departmentId: advisorDepartment.id, departmentName: advisorDepartment.name };
    }

    return {};
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
