import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/shared/decorators/auth.decorators';
import { Permission } from '@/shared/types/enums';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { AuditService } from './audit.service';
import { AuditLogResponseDto } from './dto/audit-response.dto';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(Permission.AuditRead)
  @ApiOperation({ summary: 'List audit logs' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get('record/:tableName/:recordId')
  @RequirePermissions(Permission.AuditRead)
  findByRecord(
    @Param('tableName') tableName: string,
    @Param('recordId', ParseIntPipe) recordId: number,
  ): Promise<AuditLogResponseDto[]> {
    return this.auditService.findByRecord(tableName, recordId);
  }

  @Get(':id')
  @RequirePermissions(Permission.AuditRead)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AuditLogResponseDto> {
    return this.auditService.findById(id);
  }
}
