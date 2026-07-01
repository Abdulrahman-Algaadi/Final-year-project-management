import { SelectQueryBuilder, ObjectLiteral, Repository } from 'typeorm';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { applyPagination, buildPaginationMeta } from '@/shared/utils/query.util';

export async function paginateQuery<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  options: QueryOptions,
  defaultSort = 'id',
): Promise<{ items: T[]; meta: PaginationMeta }> {
  const total = await qb.getCount();
  applyPagination(qb, alias, options, defaultSort);
  const items = await qb.getMany();
  return { items, meta: buildPaginationMeta(total, options) };
}

export async function findAllPaginated<T extends ObjectLiteral>(
  repository: Repository<T>,
  alias: string,
  options: QueryOptions,
  searchFields: string[] = [],
  relations: string[] = [],
  defaultSort = 'id',
): Promise<{ items: T[]; meta: PaginationMeta }> {
  const qb = repository.createQueryBuilder(alias);
  relations.forEach((rel) => qb.leftJoinAndSelect(`${alias}.${rel}`, rel));

  if (options.search && searchFields.length) {
    const conditions = searchFields.map((f) => `${alias}.${f} ILIKE :search`).join(' OR ');
    qb.andWhere(`(${conditions})`, { search: `%${options.search}%` });
  }

  return paginateQuery(qb, alias, options, defaultSort);
}
