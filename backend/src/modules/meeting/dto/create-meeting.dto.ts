import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty()
  @IsInt()
  groupId!: number;

  @ApiProperty()
  @IsInt()
  advisorId!: number;

  @ApiProperty()
  @IsDateString()
  meetingDate!: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  onlineLink?: string;
}
