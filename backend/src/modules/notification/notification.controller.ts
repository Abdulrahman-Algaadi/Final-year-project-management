import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/shared/decorators/auth.decorators';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Permission } from '@/shared/types/enums';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @RequirePermissions(Permission.NotificationRead)
  findAll(@Query() query: PaginationQueryDto) {
    return this.notificationService.findAll(query);
  }

  @Get('me')
  @RequirePermissions(Permission.NotificationReadOwn)
  findOwn(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.notificationService.findOwnPaginated(user, query);
  }

  @Get('me/unread')
  @RequirePermissions(Permission.NotificationReadOwn)
  findUnread(@CurrentUser() user: AuthenticatedUser): Promise<NotificationResponseDto[]> {
    return this.notificationService.findUnread(user);
  }

  @Patch('me/read-all')
  @RequirePermissions(Permission.NotificationReadOwn)
  markAllAsRead(@CurrentUser() user: AuthenticatedUser): Promise<{ updated: number }> {
    return this.notificationService.markAllAsRead(user);
  }

  @Post()
  @RequirePermissions(Permission.UserManage)
  create(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationService.create(dto);
  }

  @Patch(':id/read')
  @RequirePermissions(Permission.NotificationReadOwn)
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(id, user);
  }
}
