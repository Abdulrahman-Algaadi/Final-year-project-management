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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@ApiTags('departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @RequirePermissions(Permission.DepartmentRead)
  @ApiOperation({ summary: 'List departments' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.DepartmentRead)
  @ApiOperation({ summary: 'Get department by id' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<DepartmentResponseDto> {
    return this.departmentService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.DepartmentCreate)
  @ApiOperation({ summary: 'Create department' })
  create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentService.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.DepartmentUpdate)
  @ApiOperation({ summary: 'Update department' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.DepartmentDelete)
  @ApiOperation({ summary: 'Soft-delete department' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.departmentService.remove(id);
  }
}
