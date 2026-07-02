import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  groupName!: string;
}

export class AddGroupMemberDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  studentId!: number;

  @ApiPropertyOptional({ description: 'Defaults to StudentStatus Active when omitted' })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isLeader?: boolean;
}

export class AssignGroupProjectDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  projectId!: number;
}
