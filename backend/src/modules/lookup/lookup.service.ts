import { Injectable } from '@nestjs/common';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { LookupCategory } from '@/shared/types/enums';
import { PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { CreateLookupDto } from './dto/create-lookup.dto';
import { UpdateLookupDto } from './dto/update-lookup.dto';
import { LookupResponseDto } from './dto/lookup-response.dto';
import { LookupRepository } from './lookup.repository';
import { LookupMapper } from './lookup.mapper';
import { LookupErrors } from './lookup.errors';

@Injectable()
export class LookupService {
  constructor(
    private readonly repository: LookupRepository,
    private readonly mapper: LookupMapper,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: LookupResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(options);
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findByCategory(category: LookupCategory): Promise<LookupResponseDto[]> {
    const items = await this.repository.findByCategory(category);
    return this.mapper.toResponseList(items);
  }

  async findById(id: number): Promise<LookupResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Lookup', id);
    }
    return this.mapper.toResponse(entity);
  }

  async create(dto: CreateLookupDto): Promise<LookupResponseDto> {
    const existing = await this.repository.findByCategoryAndValue(dto.category, dto.value.trim());
    if (existing) {
      throw DomainException.conflict('Lookup value already exists', LookupErrors.DUPLICATE_VALUE);
    }
    const entity = this.repository.create({
      category: dto.category,
      value: dto.value.trim(),
    });
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async update(id: number, dto: UpdateLookupDto): Promise<LookupResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Lookup', id);
    }
    const category = dto.category ?? entity.category;
    const value = dto.value?.trim() ?? entity.value;
    const existing = await this.repository.findByCategoryAndValue(category, value);
    if (existing && existing.id !== id) {
      throw DomainException.conflict('Lookup value already exists', LookupErrors.DUPLICATE_VALUE);
    }
    entity.category = category;
    entity.value = value;
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Lookup', id);
    }
    await this.repository.delete(id);
  }
}
