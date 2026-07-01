import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  registrationNo!: string;

  @ApiProperty()
  departmentId!: number;

  @ApiProperty()
  semesterId!: number;

  @ApiProperty()
  enrollmentYear!: number;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  genderId?: number;

  @ApiPropertyOptional()
  contactNo?: string;
}
