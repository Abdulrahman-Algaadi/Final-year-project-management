import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lookup } from '@/database/entities/department.entity';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { findAllPaginated } from '@/shared/utils/repository.util';

@Injectable()
export class LookupRepository {
  constructor(@InjectRepository(Lookup) private readonly repository: Repository<Lookup>) {}

  async findById(id: number): Promise<Lookup | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCategoryAndValue(category: string, value: string): Promise<Lookup | null> {
    return this.repository.findOne({ where: { category, value } });
  }

  async findByCategory(category: string): Promise<Lookup[]> {
    return this.repository.find({ where: { category }, order: { value: 'ASC' } });
  }

  async findAll(options: QueryOptions): Promise<{ items: Lookup[]; meta: PaginationMeta }> {
    return findAllPaginated(this.repository, 'lookup', options, ['category', 'value']);
  }

  create(data: Partial<Lookup>): Lookup {
    return this.repository.create(data);
  }

  async save(entity: Lookup): Promise<Lookup> {
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
