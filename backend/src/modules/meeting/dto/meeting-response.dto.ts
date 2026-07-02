import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeetingResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  groupId!: number;

  @ApiProperty()
  advisorId!: number;

  @ApiProperty()
  meetingDate!: Date;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  onlineLink?: string;

  @ApiPropertyOptional()
  advisorFirstName?: string;

  @ApiPropertyOptional()
  advisorLastName?: string;
}
