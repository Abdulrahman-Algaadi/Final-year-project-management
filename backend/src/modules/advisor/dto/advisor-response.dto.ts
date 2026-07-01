import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdvisorResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  departmentId!: number;

  @ApiProperty()
  designationId!: number;

  @ApiPropertyOptional()
  salary?: number;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  email?: string;
}
