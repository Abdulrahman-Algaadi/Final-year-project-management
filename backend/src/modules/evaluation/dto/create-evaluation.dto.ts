import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  totalMarks!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  weight!: number;
}

export class CreateGroupEvaluationDto {
  @ApiProperty()
  @IsInt()
  groupId!: number;

  @ApiProperty()
  @IsInt()
  evaluationId!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  obtainedMarks!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateGroupEvaluationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  obtainedMarks?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
