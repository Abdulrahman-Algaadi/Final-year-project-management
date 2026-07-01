import { StudentGroup } from '@/database/entities/student-group.entity';
import { Injectable } from '@nestjs/common';
import { GroupResponseDto } from './dto/group-response.dto';

@Injectable()
export class GroupMapper {
  toResponse(entity: StudentGroup): GroupResponseDto {
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
    };
  }

  toResponseList(entities: StudentGroup[]): GroupResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
