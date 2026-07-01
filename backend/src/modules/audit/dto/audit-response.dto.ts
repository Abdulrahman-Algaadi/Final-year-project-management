import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  tableName!: string;

  @ApiProperty()
  recordId!: number;

  @ApiProperty()
  actionType!: string;

  @ApiPropertyOptional()
  performedById?: number;

  @ApiProperty()
  actionDate!: Date;
}
