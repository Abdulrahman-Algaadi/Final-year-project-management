import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { mapAdvisor, mapAdvisorList } from "@/lib/api/mappers/advisor.mapper";
import { fetchDepartments } from "@/lib/api/services/departments.service";
import { fetchLookupsByCategory } from "@/lib/api/services/lookups.service";
import type { Advisor } from "@/types";
import type {
  AdvisorDto,
  CreateAdvisorPayload,
  ListQuery,
  PaginatedResult,
  UpdateAdvisorPayload,
} from "@/types/api";

async function advisorMapperContext() {
  const [departments, designations] = await Promise.all([
    fetchDepartments({ limit: 100 }),
    fetchLookupsByCategory("Designation"),
  ]);
  return {
    departments: new Map(departments.map((d) => [d.id, { name: d.name, code: d.code }])),
    designations: new Map(designations.map((d) => [d.id, d.value])),
  };
}

export async function fetchAdvisorsPaginated(query?: ListQuery): Promise<PaginatedResult<Advisor>> {
  const [result, ctx] = await Promise.all([
    apiGetPaginated<AdvisorDto>("/advisors", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search,
    }),
    advisorMapperContext(),
  ]);
  return {
    items: mapAdvisorList(result.items, ctx),
    meta: result.meta,
  };
}

export async function createAdvisor(input: CreateAdvisorPayload): Promise<Advisor> {
  const ctx = await advisorMapperContext();
  const created = await apiClient<AdvisorDto>("/advisors", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapAdvisor(created, ctx);
}

export async function updateAdvisor(id: number, input: UpdateAdvisorPayload): Promise<Advisor> {
  const ctx = await advisorMapperContext();
  const updated = await apiClient<AdvisorDto>(`/advisors/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return mapAdvisor(updated, ctx);
}

export async function deleteAdvisor(id: number): Promise<void> {
  await apiClient<void>(`/advisors/${id}`, { method: "DELETE" });
}
