import { StudentGroup } from '@/database/entities/student-group.entity';
import { ProjectAdvisor } from '@/database/entities/project-advisor.entity';
import { Injectable } from '@nestjs/common';
import { GroupResponseDto } from './dto/group-response.dto';

@Injectable()
export class GroupMapper {
  toResponse(entity: StudentGroup, projectAdvisors?: ProjectAdvisor[]): GroupResponseDto {
    return {
      id: entity.id,
      groupName: entity.groupName,
      createdOn: entity.createdOn,
      members: entity.members?.map((m) => ({
        id: m.id,
        studentId: m.studentId,
        isLeader: m.isLeader,
        statusId: m.statusId,
        assignmentDate: m.assignmentDate,
      })),
      project: entity.projectAssignment
        ? {
            id: entity.projectAssignment.id,
            projectId: entity.projectAssignment.projectId,
            assignedDate: entity.projectAssignment.assignedDate,
          }
        : undefined,
      advisors: projectAdvisors?.map((a) => ({
        id: a.id,
        advisorId: a.advisorId,
        advisorRoleId: a.advisorRoleId,
        assignmentDate: a.assignmentDate,
      })),
    };
  }

  toResponseList(entities: StudentGroup[]): GroupResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
