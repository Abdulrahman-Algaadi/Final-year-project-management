import { Injectable } from '@nestjs/common';
import { Semester } from '@/database/entities/department.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemesterResponseDto } from './dto/semester-response.dto';
import { SemesterRepository } from './semester.repository';
import { SemesterMapper } from './semester.mapper';
import { SemesterErrors } from './semester.errors';

@Injectable()
export class SemesterService {
  constructor(
    private readonly repository: SemesterRepository,
    private readonly mapper: SemesterMapper,
  ) {}

  private validateDateRange(startDate?: string, endDate?: string): void {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      throw DomainException.businessRule(
        'End date must be on or after start date',
        SemesterErrors.INVALID_DATE_RANGE,
      );
    }
  }

  async findAll(options: QueryOptions): Promise<{ items: SemesterResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(
      { ...options, sortBy: options.sortBy ?? 'id' },
      'semester',
      ['name', 'academicYear'],
    );
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findById(id: number): Promise<SemesterResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Semester', id);
    }
    return this.mapper.toResponse(entity);
  }

  async create(dto: CreateSemesterDto): Promise<SemesterResponseDto> {
    this.validateDateRange(dto.startDate, dto.endDate);
    const entity = this.repository.create({
      name: dto.name.trim(),
      academicYear: dto.academicYear.trim(),
      startDate: dto.startDate,
      endDate: dto.endDate,
    } as Semester);
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async update(id: number, dto: UpdateSemesterDto): Promise<SemesterResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Semester', id);
    }
    const startDate = dto.startDate ?? entity.startDate;
    const endDate = dto.endDate ?? entity.endDate;
    this.validateDateRange(startDate, endDate);

    if (dto.name) entity.name = dto.name.trim();
    if (dto.academicYear) entity.academicYear = dto.academicYear.trim();
    if (dto.startDate !== undefined) entity.startDate = dto.startDate;
    if (dto.endDate !== undefined) entity.endDate = dto.endDate;

    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Semester', id);
    }
    await this.repository.softDelete(id);
  }
}
