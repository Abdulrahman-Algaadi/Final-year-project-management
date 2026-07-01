import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationMeta, QueryOptions } from '../types/common.types';

export function applyPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  options: QueryOptions,
  defaultSort = 'id',
): SelectQueryBuilder<T> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const sortBy = options.sortBy ?? defaultSort;
  const sortOrder = options.sortOrder ?? 'DESC';

  const sortColumn = sortBy.includes('.') ? sortBy : `${alias}.${sortBy}`;
  qb.orderBy(sortColumn, sortOrder);
  qb.skip((page - 1) * limit).take(limit);
  return qb;
}

export function buildPaginationMeta(total: number, options: QueryOptions): PaginationMeta {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export function applySoftDeleteFilter<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  includeDeleted?: boolean,
) {
  if (!includeDeleted) {
    qb.andWhere(`${alias}.deletedAt IS NULL`);
  }
  return qb;
}
