import { Injectable } from '@nestjs/common';
import { Department } from '@/database/entities/department.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { QueryOptions } from '@/shared/types/common.types';
import { PaginationMeta } from '@/shared/types/common.types';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { DepartmentRepository } from './department.repository';
import { DepartmentMapper } from './department.mapper';
import { DepartmentErrors } from './department.errors';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly repository: DepartmentRepository,
    private readonly mapper: DepartmentMapper,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: DepartmentResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(options, 'department', ['name', 'code']);
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findById(id: number): Promise<DepartmentResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Department', id);
    }
    return this.mapper.toResponse(entity);
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw DomainException.conflict('Department code already exists', DepartmentErrors.CODE_EXISTS);
    }
    const entity = this.repository.create({
      name: dto.name.trim(),
      code: dto.code.trim(),
      createdAt: new Date(),
    } as Department);
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Department', id);
    }
    if (dto.code && dto.code !== entity.code) {
      const existing = await this.repository.findByCode(dto.code);
      if (existing) {
        throw DomainException.conflict('Department code already exists', DepartmentErrors.CODE_EXISTS);
      }
      entity.code = dto.code.trim();
    }
    if (dto.name) entity.name = dto.name.trim();
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Department', id);
    }
    await this.repository.softDelete(id);
  }
}
