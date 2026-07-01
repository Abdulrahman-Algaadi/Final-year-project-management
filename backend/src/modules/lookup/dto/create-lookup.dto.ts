import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { LookupCategory } from '@/shared/types/enums';

export class CreateLookupDto {
  @ApiProperty({ enum: LookupCategory })
  @IsEnum(LookupCategory)
  category!: LookupCategory;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value!: string;
}
