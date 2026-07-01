import { AuditLog } from '@/database/entities/audit-log.entity';
import { Injectable } from '@nestjs/common';
import { AuditLogResponseDto } from './dto/audit-response.dto';

@Injectable()
export class AuditMapper {
  toResponse(entity: AuditLog): AuditLogResponseDto {
    return {
      id: entity.id,
      tableName: entity.tableName,
      recordId: entity.recordId,
      actionType: entity.actionType,
      performedById: entity.performedById,
      actionDate: entity.actionDate,
    };
  }

  toResponseList(entities: AuditLog[]): AuditLogResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
