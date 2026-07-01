import { Injectable } from '@nestjs/common';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { AuditLogResponseDto } from './dto/audit-response.dto';
import { AuditRepository, CreateAuditLogInput } from './audit.repository';
import { AuditMapper } from './audit.mapper';

@Injectable()
export class AuditService {
  constructor(
    private readonly repository: AuditRepository,
    private readonly mapper: AuditMapper,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: AuditLogResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(options);
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findById(id: number): Promise<AuditLogResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Audit log', id);
    }
    return this.mapper.toResponse(entity);
  }

  async findByRecord(tableName: string, recordId: number): Promise<AuditLogResponseDto[]> {
    const items = await this.repository.findByTableAndRecord(tableName, recordId);
    return this.mapper.toResponseList(items);
  }

  async log(input: CreateAuditLogInput): Promise<AuditLogResponseDto> {
    const saved = await this.repository.createLog(input);
    return this.mapper.toResponse(saved);
  }
}
