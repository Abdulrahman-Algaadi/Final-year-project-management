import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsInt()
  personId!: number;

  @ApiProperty({ maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string;
}
