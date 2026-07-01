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
import { Public, RequirePermissions } from '@/shared/decorators/auth.decorators';
import { Permission, LookupCategory } from '@/shared/types/enums';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { LookupService } from './lookup.service';
import { CreateLookupDto } from './dto/create-lookup.dto';
import { UpdateLookupDto } from './dto/update-lookup.dto';
import { LookupResponseDto } from './dto/lookup-response.dto';

@ApiTags('lookups')
@Controller('lookups')
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List lookups' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.lookupService.findAll(query);
  }

  @Get('category/:category')
  @Public()
  @ApiOperation({ summary: 'List lookups by category' })
  findByCategory(@Param('category') category: LookupCategory): Promise<LookupResponseDto[]> {
    return this.lookupService.findByCategory(category);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get lookup by id' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<LookupResponseDto> {
    return this.lookupService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(Permission.UserManage)
  @ApiOperation({ summary: 'Create lookup' })
  create(@Body() dto: CreateLookupDto): Promise<LookupResponseDto> {
    return this.lookupService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @RequirePermissions(Permission.UserManage)
  @ApiOperation({ summary: 'Update lookup' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLookupDto,
  ): Promise<LookupResponseDto> {
    return this.lookupService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(Permission.UserManage)
  @ApiOperation({ summary: 'Delete lookup' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.lookupService.remove(id);
  }
}
