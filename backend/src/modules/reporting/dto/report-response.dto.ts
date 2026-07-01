import { ApiProperty } from '@nestjs/swagger';

export class ProjectSummaryReportDto {
  @ApiProperty()
  totalProjects!: number;

  @ApiProperty()
  pending!: number;

  @ApiProperty()
  ongoing!: number;

  @ApiProperty()
  completed!: number;

  @ApiProperty()
  archived!: number;
}

export class StudentEnrollmentReportDto {
  @ApiProperty()
  departmentId!: number;

  @ApiProperty()
  departmentName!: string;

  @ApiProperty()
  studentCount!: number;
}

export class EvaluationSummaryReportDto {
  @ApiProperty()
  evaluationId!: number;

  @ApiProperty()
  evaluationName!: string;

  @ApiProperty()
  groupsEvaluated!: number;

  @ApiProperty()
  averageMarks!: number;
}

export class SubmissionSummaryReportDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  pending!: number;

  @ApiProperty()
  approved!: number;

  @ApiProperty()
  rejected!: number;

  @ApiProperty()
  revisionRequired!: number;
}

export class ProjectByDepartmentReportDto {
  @ApiProperty()
  departmentId!: number;

  @ApiProperty()
  departmentName!: string;

  @ApiProperty()
  projectCount!: number;
}
