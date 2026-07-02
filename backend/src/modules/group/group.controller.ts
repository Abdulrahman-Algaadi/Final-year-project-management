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
import { GroupService } from './group.service';
import { CreateGroupDto, AddGroupMemberDto, AssignGroupProjectDto } from './dto/create-group.dto';
import { AssignGroupAdvisorDto } from './dto/assign-group-advisor.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @RequirePermissions(Permission.GroupRead)
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.groupService.findAllForUser(user, query);
  }

  @Get('advisor/me')
  @RequirePermissions(Permission.MeetingCreate)
  @ApiOperation({ summary: 'Groups assigned to the current advisor' })
  findAdvisorAssigned(@CurrentUser() user: AuthenticatedUser): Promise<GroupResponseDto[]> {
    return this.groupService.findAssignedToAdvisor(user);
  }

  @Get('me')
  @RequirePermissions(Permission.GroupReadOwn)
  findOwn(@CurrentUser() user: AuthenticatedUser): Promise<GroupResponseDto> {
    return this.groupService.findOwn(user);
  }

  @Get(':id')
  @RequirePermissions(Permission.GroupRead, Permission.GroupReadOwn)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GroupResponseDto> {
    return this.groupService.findByIdForUser(user, id);
  }

  @Post()
  @RequirePermissions(Permission.GroupCreate)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.createForUser(user, dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.GroupUpdate)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.updateForUser(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.GroupDelete)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.groupService.removeForUser(user, id);
  }

  @Post(':id/members')
  @RequirePermissions(Permission.GroupUpdate)
  addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddGroupMemberDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.addMemberForUser(user, id, dto);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions(Permission.GroupUpdate)
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<GroupResponseDto> {
    return this.groupService.removeMemberForUser(user, id, memberId);
  }

  @Post(':id/project')
  @RequirePermissions(Permission.GroupUpdate)
  assignProject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignGroupProjectDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.assignProjectForUser(user, id, dto);
  }

  @Post(':id/advisors')
  @RequirePermissions(Permission.GroupUpdate)
  @ApiOperation({ summary: 'Assign an advisor to the group project' })
  assignAdvisor(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignGroupAdvisorDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.assignAdvisorForUser(user, id, dto);
  }

  @Delete(':id/advisors/:assignmentId')
  @RequirePermissions(Permission.GroupUpdate)
  @ApiOperation({ summary: 'Remove an advisor from the group project' })
  removeAdvisor(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ): Promise<GroupResponseDto> {
    return this.groupService.removeAdvisorForUser(user, id, assignmentId);
  }
}
