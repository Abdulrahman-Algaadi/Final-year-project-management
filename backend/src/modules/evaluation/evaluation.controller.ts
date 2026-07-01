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
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto, CreateGroupEvaluationDto, UpdateGroupEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { EvaluationResponseDto, GroupEvaluationResponseDto } from './dto/evaluation-response.dto';

@ApiTags('evaluations')
@ApiBearerAuth()
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Get()
  @RequirePermissions(Permission.EvaluationRead)
  findAll(@Query() query: PaginationQueryDto) {
    return this.evaluationService.findAll(query);
  }

  @Get('grades')
  @RequirePermissions(Permission.EvaluationRead)
  findAllGrades(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.evaluationService.findAllGradesPaginated(user, query);
  }

  @Get('group/:groupId')
  @RequirePermissions(Permission.EvaluationRead)
  findGroupEvaluations(
    @CurrentUser() user: AuthenticatedUser,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<GroupEvaluationResponseDto[]> {
    return this.evaluationService.findGroupEvaluations(user, groupId);
  }

  @Get(':id')
  @RequirePermissions(Permission.EvaluationRead)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EvaluationResponseDto> {
    return this.evaluationService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.EvaluationCreate)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEvaluationDto,
  ): Promise<EvaluationResponseDto> {
    return this.evaluationService.createForUser(user, dto);
  }

  @Post('group')
  @RequirePermissions(Permission.EvaluationCreate)
  createGroupEvaluation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGroupEvaluationDto,
  ): Promise<GroupEvaluationResponseDto> {
    return this.evaluationService.createGroupEvaluation(user, dto);
  }

  @Put('group/:id')
  @RequirePermissions(Permission.EvaluationUpdate)
  updateGroupEvaluation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateGroupEvaluationDto,
  ): Promise<GroupEvaluationResponseDto> {
    return this.evaluationService.updateGroupEvaluation(id, user, dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.EvaluationUpdate)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEvaluationDto,
  ): Promise<EvaluationResponseDto> {
    return this.evaluationService.updateForUser(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.EvaluationDelete)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.evaluationService.removeForUser(user, id);
  }
}
