import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvaluationResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  totalMarks!: number;

  @ApiProperty()
  weight!: number;
}

export class GroupEvaluationResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  groupId!: number;

  @ApiProperty()
  evaluationId!: number;

  @ApiProperty()
  obtainedMarks!: number;

  @ApiProperty()
  evaluationDate!: string;

  @ApiProperty()
  evaluatedById!: number;

  @ApiPropertyOptional()
  comments?: string;

  @ApiProperty()
  isPublished!: boolean;
}
