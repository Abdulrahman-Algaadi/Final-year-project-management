import { ApiProperty } from '@nestjs/swagger';

export class ReferenceDepartmentDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  code!: string;
}

export class ReferenceSemesterDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}

export class ReferenceStudentDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  registrationNo!: string;
}

export class ReferenceProjectDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;
}

export class ReferenceGroupDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  groupName!: string;
}

export class ReferenceEvaluationDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  totalMarks!: number;
}

export class ReferenceAdvisorDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class ReferenceResponseDto {
  @ApiProperty({ type: [ReferenceDepartmentDto] })
  departments!: ReferenceDepartmentDto[];

  @ApiProperty({ type: [ReferenceSemesterDto] })
  semesters!: ReferenceSemesterDto[];

  @ApiProperty({ type: [ReferenceStudentDto] })
  students!: ReferenceStudentDto[];

  @ApiProperty({ type: [ReferenceProjectDto] })
  projects!: ReferenceProjectDto[];

  @ApiProperty({ type: [ReferenceGroupDto] })
  groups!: ReferenceGroupDto[];

  @ApiProperty({ type: [ReferenceEvaluationDto] })
  evaluations!: ReferenceEvaluationDto[];

  @ApiProperty({ type: [ReferenceAdvisorDto] })
  advisors!: ReferenceAdvisorDto[];
}
