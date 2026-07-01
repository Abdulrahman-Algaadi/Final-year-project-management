import { Lookup } from '@/database/entities/department.entity';
import { Injectable } from '@nestjs/common';
import { LookupResponseDto } from './dto/lookup-response.dto';

@Injectable()
export class LookupMapper {
  toResponse(entity: Lookup): LookupResponseDto {
    return { id: entity.id, category: entity.category, value: entity.value };
  }

  toResponseList(entities: Lookup[]): LookupResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
