import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupMemberResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  studentId!: number;

  @ApiProperty()
  isLeader!: boolean;

  @ApiProperty()
  statusId!: number;

  @ApiProperty()
  assignmentDate!: string;
}

export class GroupProjectResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  projectId!: number;

  @ApiProperty()
  assignedDate!: string;
}

export class GroupAdvisorResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  advisorId!: number;

  @ApiProperty()
  advisorRoleId!: number;

  @ApiProperty()
  assignmentDate!: string;
}

export class GroupResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  groupName!: string;

  @ApiProperty()
  createdOn!: Date;

  @ApiPropertyOptional({ type: [GroupMemberResponseDto] })
  members?: GroupMemberResponseDto[];

  @ApiPropertyOptional()
  project?: GroupProjectResponseDto;

  @ApiPropertyOptional({ type: [GroupAdvisorResponseDto] })
  advisors?: GroupAdvisorResponseDto[];
}
