import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SemesterResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  academicYear!: string;

  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;
}
