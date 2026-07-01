import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/shared/decorators/auth.decorators';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Permission } from '@/shared/types/enums';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto, ReviewSubmissionDto } from './dto/create-submission.dto';
import {
  SubmissionDownloadResponseDto,
  SubmissionUploadResponseDto,
} from './dto/submission-download.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  @RequirePermissions(Permission.SubmissionRead)
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.submissionService.findAllForUser(user, query);
  }

  @Get('group/:groupId')
  @RequirePermissions(Permission.SubmissionRead)
  findByGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionService.findByGroup(user, groupId);
  }

  @Get(':id/download')
  @RequirePermissions(Permission.SubmissionRead)
  @ApiOperation({ summary: 'Get signed download URL for submission file' })
  download(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SubmissionDownloadResponseDto> {
    return this.submissionService.getDownloadUrl(user, id);
  }

  @Get(':id')
  @RequirePermissions(Permission.SubmissionRead)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.findById(user, id);
  }

  @Post('upload')
  @RequirePermissions(Permission.SubmissionCreate)
  @ApiOperation({ summary: 'Upload submission file to storage' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('groupId', ParseIntPipe) groupId: number,
  ): Promise<SubmissionUploadResponseDto> {
    if (!file) {
      throw DomainException.badRequest('File is required');
    }
    return this.submissionService.uploadFile(user, groupId, file);
  }

  @Post()
  @RequirePermissions(Permission.SubmissionCreate)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.create(user, dto);
  }

  @Put(':id/review')
  @RequirePermissions(Permission.SubmissionApprove)
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.review(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.SubmissionDelete)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.submissionService.remove(user, id);
  }
}
