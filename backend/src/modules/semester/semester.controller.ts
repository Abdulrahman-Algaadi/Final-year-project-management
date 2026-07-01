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
import { Permission } from '@/shared/types/enums';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemesterResponseDto } from './dto/semester-response.dto';

@ApiTags('semesters')
@ApiBearerAuth()
@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get()
  @RequirePermissions(Permission.DepartmentRead)
  @ApiOperation({ summary: 'List semesters' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.semesterService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.DepartmentRead)
  @ApiOperation({ summary: 'Get semester by id' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SemesterResponseDto> {
    return this.semesterService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.UserManage)
  @ApiOperation({ summary: 'Create semester' })
  create(@Body() dto: CreateSemesterDto): Promise<SemesterResponseDto> {
    return this.semesterService.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.UserManage)
  @ApiOperation({ summary: 'Update semester' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSemesterDto,
  ): Promise<SemesterResponseDto> {
    return this.semesterService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.UserManage)
  @ApiOperation({ summary: 'Soft-delete semester' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.semesterService.remove(id);
  }
}
