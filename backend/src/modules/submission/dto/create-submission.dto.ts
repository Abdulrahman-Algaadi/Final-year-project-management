import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { SubmissionType } from '@/shared/types/enums';

export class CreateSubmissionDto {
  @ApiProperty()
  @IsInt()
  groupId!: number;

  @ApiProperty({ maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  filePath!: string;

  @ApiPropertyOptional({ enum: SubmissionType })
  @IsOptional()
  @IsEnum(SubmissionType)
  submissionType?: SubmissionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storageBucket?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}

export class ReviewSubmissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status!: string;
}
