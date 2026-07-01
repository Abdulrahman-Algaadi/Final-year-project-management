import { Semester } from '@/database/entities/department.entity';
import { Injectable } from '@nestjs/common';
import { SemesterResponseDto } from './dto/semester-response.dto';

@Injectable()
export class SemesterMapper {
  toResponse(entity: Semester): SemesterResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      academicYear: entity.academicYear,
      startDate: entity.startDate,
      endDate: entity.endDate,
    };
  }

  toResponseList(entities: Semester[]): SemesterResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
