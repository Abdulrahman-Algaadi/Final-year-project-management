import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthProfileResponseDto {
  @ApiProperty()
  userAccountId!: number;

  @ApiProperty()
  personId!: number;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  role!: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  lastLogin?: Date;
}

export class AuthSessionResponseDto {
  @ApiProperty()
  authenticated!: boolean;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  username!: string;

  @ApiPropertyOptional()
  expiresAt?: string;
}

export class LoginCallbackResponseDto {
  @ApiProperty()
  profile!: AuthProfileResponseDto;

  @ApiProperty()
  message!: string;
}

export class StudentLoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  profile!: AuthProfileResponseDto;

  @ApiProperty()
  message!: string;
}
