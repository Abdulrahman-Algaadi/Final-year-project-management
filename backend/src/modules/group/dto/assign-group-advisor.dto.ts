import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class AssignGroupAdvisorDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  advisorId!: number;

  @ApiPropertyOptional({ description: 'Defaults to AdvisorRole Supervisor when omitted' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  advisorRoleId?: number;
}
