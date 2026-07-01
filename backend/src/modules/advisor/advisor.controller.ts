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
import { AdvisorService } from './advisor.service';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { UpdateAdvisorDto } from './dto/update-advisor.dto';
import { AdvisorResponseDto } from './dto/advisor-response.dto';

@ApiTags('advisors')
@ApiBearerAuth()
@Controller('advisors')
export class AdvisorController {
  constructor(private readonly advisorService: AdvisorService) {}

  @Get()
  @RequirePermissions(Permission.AdvisorRead)
  findAll(@Query() query: PaginationQueryDto) {
    return this.advisorService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.AdvisorRead)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AdvisorResponseDto> {
    return this.advisorService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.AdvisorCreate)
  create(@Body() dto: CreateAdvisorDto): Promise<AdvisorResponseDto> {
    return this.advisorService.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.AdvisorUpdate)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdvisorDto,
  ): Promise<AdvisorResponseDto> {
    return this.advisorService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.AdvisorDelete)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.advisorService.remove(id);
  }
}
