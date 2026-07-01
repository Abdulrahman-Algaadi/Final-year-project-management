import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty()
  totalProjects!: number;

  @ApiProperty()
  totalGroups!: number;

  @ApiProperty()
  totalStudents!: number;

  @ApiProperty()
  pendingSubmissions!: number;

  @ApiPropertyOptional()
  upcomingMeetings?: number;

  @ApiPropertyOptional()
  unreadNotifications?: number;
}

export class StudentDashboardDto {
  @ApiPropertyOptional()
  groupId?: number;

  @ApiPropertyOptional()
  groupName?: string;

  @ApiPropertyOptional()
  projectTitle?: string;

  @ApiPropertyOptional()
  projectStatus?: string;

  @ApiPropertyOptional()
  departmentName?: string;

  @ApiPropertyOptional()
  semesterName?: string;

  @ApiPropertyOptional()
  advisorName?: string;

  @ApiPropertyOptional()
  advisorEmail?: string;

  @ApiPropertyOptional()
  advisorDepartment?: string;

  @ApiPropertyOptional()
  advisorDesignation?: string;

  @ApiPropertyOptional()
  nextMeetingDate?: Date;

  @ApiProperty()
  submissionCount!: number;

  @ApiProperty()
  unreadNotifications!: number;
}

export class AdvisorDashboardDto {
  @ApiProperty()
  assignedProjects!: number;

  @ApiProperty()
  upcomingMeetings!: number;

  @ApiProperty()
  pendingSubmissions!: number;

  @ApiProperty()
  evaluationsPending!: number;
}

export class AdminDashboardDto extends DashboardStatsDto {
  @ApiPropertyOptional()
  pendingProjects?: number;

  @ApiProperty()
  totalAdvisors!: number;

  @ApiProperty()
  totalDepartments!: number;
}
