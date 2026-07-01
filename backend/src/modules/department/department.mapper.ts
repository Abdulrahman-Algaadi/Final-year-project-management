import { Department } from '@/database/entities/department.entity';
import { Injectable } from '@nestjs/common';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentMapper {
  toResponse(entity: Department): DepartmentResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code,
      createdAt: entity.createdAt,
    };
  }

  toResponseList(entities: Department[]): DepartmentResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
