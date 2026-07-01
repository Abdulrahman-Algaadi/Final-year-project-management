import { Advisor } from '@/database/entities/advisor.entity';
import { Person } from '@/database/entities/person.entity';
import { Injectable } from '@nestjs/common';
import { AdvisorResponseDto } from './dto/advisor-response.dto';

@Injectable()
export class AdvisorMapper {
  toResponse(advisor: Advisor, person?: Person | null): AdvisorResponseDto {
    const p = person ?? advisor.person;
    return {
      id: advisor.id,
      departmentId: advisor.departmentId,
      designationId: advisor.designationId,
      salary: advisor.salary !== undefined ? Number(advisor.salary) : undefined,
      firstName: p?.firstName,
      lastName: p?.lastName,
      email: p?.email,
    };
  }

  toResponseList(advisors: Advisor[]): AdvisorResponseDto[] {
    return advisors.map((a) => this.toResponse(a));
  }
}
