import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@/database/entities/audit-log.entity';
import { AuditActionType } from '@/shared/types/enums';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { findAllPaginated } from '@/shared/utils/repository.util';

export interface CreateAuditLogInput {
  tableName: string;
  recordId: number;
  actionType: AuditActionType | string;
  performedById?: number;
}

@Injectable()
export class AuditRepository {
  constructor(@InjectRepository(AuditLog) private readonly repository: Repository<AuditLog>) {}

  async findById(id: number): Promise<AuditLog | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(options: QueryOptions): Promise<{ items: AuditLog[]; meta: PaginationMeta }> {
    return findAllPaginated(this.repository, 'audit_log', options, ['tableName', 'actionType'], [], 'actionDate');
  }

  async findByTableAndRecord(tableName: string, recordId: number): Promise<AuditLog[]> {
    return this.repository.find({
      where: { tableName, recordId },
      order: { actionDate: 'DESC' },
    });
  }

  async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
    const entity = this.repository.create({
      tableName: input.tableName,
      recordId: input.recordId,
      actionType: input.actionType,
      performedById: input.performedById,
      actionDate: new Date(),
    });
    return this.repository.save(entity);
  }
}
