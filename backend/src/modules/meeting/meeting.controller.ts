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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/shared/decorators/auth.decorators';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Permission } from '@/shared/types/enums';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingResponseDto } from './dto/meeting-response.dto';

@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Get()
  @RequirePermissions(Permission.MeetingRead)
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.meetingService.findAllForUser(user, query);
  }

  @Get('group/:groupId')
  @RequirePermissions(Permission.MeetingRead)
  findByGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<MeetingResponseDto[]> {
    return this.meetingService.findByGroup(user, groupId);
  }

  @Get(':id')
  @RequirePermissions(Permission.MeetingRead)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.findById(user, id);
  }

  @Post()
  @RequirePermissions(Permission.MeetingCreate)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMeetingDto,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.create(user, dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.MeetingUpdate)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeetingDto,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MeetingDelete)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.meetingService.remove(user, id);
  }
}
