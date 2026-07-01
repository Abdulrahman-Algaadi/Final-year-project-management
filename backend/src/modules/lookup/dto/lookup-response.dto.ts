import { ApiProperty } from '@nestjs/swagger';

export class LookupResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  value!: string;
}
