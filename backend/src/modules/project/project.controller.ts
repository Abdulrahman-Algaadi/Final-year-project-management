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
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @RequirePermissions(Permission.ProjectRead)
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.projectService.findAllForUser(user, query);
  }

  @Get(':id')
  @RequirePermissions(Permission.ProjectRead)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectResponseDto> {
    return this.projectService.findByIdForUser(user, id);
  }

  @Post()
  @RequirePermissions(Permission.ProjectCreate)
  create(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projectService.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.ProjectUpdate)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateForUser(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.ProjectDelete)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.projectService.removeForUser(user, id);
  }
}
