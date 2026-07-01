import { Repository, FindOptionsWhere, ObjectLiteral, DeepPartial } from 'typeorm';
import { QueryOptions } from '@/shared/types/common.types';
import { applyPagination, applySoftDeleteFilter, buildPaginationMeta } from '@/shared/utils/query.util';

export abstract class BaseRepository<T extends ObjectLiteral & { id: number; deletedAt?: Date | null }> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: number, relations: string[] = []): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
      withDeleted: false,
    });
  }

  async findAll(
    options: QueryOptions,
    alias: string,
    searchFields: string[] = [],
    relations: string[] = [],
    defaultSort = 'id',
  ): Promise<{ items: T[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const qb = this.repository.createQueryBuilder(alias);
    relations.forEach((rel) => qb.leftJoinAndSelect(`${alias}.${rel}`, rel));

    applySoftDeleteFilter(qb, alias, options.includeDeleted);

    if (options.search && searchFields.length) {
      const conditions = searchFields.map((f) => `${alias}.${f} ILIKE :search`).join(' OR ');
      qb.andWhere(`(${conditions})`, { search: `%${options.search}%` });
    }

    const total = await qb.getCount();
    applyPagination(qb, alias, options, defaultSort);
    const items = await qb.getMany();

    return { items, meta: buildPaginationMeta(total, options) };
  }

  create(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    await this.repository.restore(id);
  }

  async hardDelete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
