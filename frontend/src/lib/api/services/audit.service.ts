import { apiGetPaginated } from "@/lib/api/client";
import type { AuditLogDto, ListQuery, PaginatedResult } from "@/types/api";

export async function fetchAuditLogsPaginated(query?: ListQuery): Promise<PaginatedResult<AuditLogDto>> {
  return apiGetPaginated<AuditLogDto>("/audit", {
    page: query?.page ?? 1,
    limit: query?.limit ?? 20,
    search: query?.search,
    sortBy: query?.sortBy ?? "actionDate",
    sortOrder: query?.sortOrder ?? "DESC",
  });
}
