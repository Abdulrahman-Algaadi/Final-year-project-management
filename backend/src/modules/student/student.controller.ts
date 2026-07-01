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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @RequirePermissions(Permission.StudentRead)
  @ApiOperation({ summary: 'List students' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.studentService.findAllForUser(user, query);
  }

  @Get('me')
  @RequirePermissions(Permission.StudentReadOwn)
  @ApiOperation({ summary: 'Get current student profile' })
  findOwn(@CurrentUser() user: AuthenticatedUser): Promise<StudentResponseDto> {
    return this.studentService.findOwn(user);
  }

  @Get(':id')
  @RequirePermissions(Permission.StudentRead, Permission.StudentReadOwn)
  @ApiOperation({ summary: 'Get student by id' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentResponseDto> {
    return this.studentService.findByIdForUser(user, id);
  }

  @Post()
  @RequirePermissions(Permission.StudentCreate)
  @ApiOperation({ summary: 'Create student' })
  create(@Body() dto: CreateStudentDto): Promise<StudentResponseDto> {
    return this.studentService.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.StudentUpdate)
  @ApiOperation({ summary: 'Update student' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.studentService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.StudentDelete)
  @ApiOperation({ summary: 'Soft-delete student' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentService.remove(id);
  }
}
