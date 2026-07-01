import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDownloadResponseDto {
  @ApiProperty()
  url!: string;

  @ApiProperty()
  fileName!: string;
}

export class SubmissionUploadResponseDto {
  @ApiProperty()
  path!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  storageBucket!: string;
}
