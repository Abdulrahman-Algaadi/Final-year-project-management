import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @IsInt()
  studentId!: number;

  @ApiPropertyOptional({ description: 'Defaults to StudentStatus Active when omitted' })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isLeader?: boolean;
}

export class AssignGroupProjectDto {
  @ApiProperty()
  @IsInt()
  projectId!: number;
}
