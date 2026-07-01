import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmissionResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  groupId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  filePath!: string;

  @ApiProperty()
  versionNo!: number;

  @ApiProperty()
  submittedAt!: Date;

  @ApiPropertyOptional()
  submissionType?: string;

  @ApiProperty()
  status!: string;
}
