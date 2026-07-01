import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  semesterId!: number;

  @ApiPropertyOptional()
  semesterName?: string;

  @ApiProperty()
  statusId!: number;

  @ApiPropertyOptional()
  statusName?: string;

  @ApiPropertyOptional()
  departmentId?: number;

  @ApiPropertyOptional()
  departmentName?: string;

  @ApiProperty()
  createdAt!: Date;
}
