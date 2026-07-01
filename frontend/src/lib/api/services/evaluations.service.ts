import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { mapEvaluation, mapGroupEvaluationList } from "@/lib/api/mappers/evaluation.mapper";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import type { Evaluation, GroupEvaluation } from "@/types";
import type { EvaluationDto, GroupEvaluationDto, ListQuery, PaginatedResult } from "@/types/api";

export async function fetchEvaluationsPaginated(query?: ListQuery): Promise<PaginatedResult<Evaluation>> {
  const { items, meta } = await apiGetPaginated<EvaluationDto>("/evaluations", {
    page: query?.page ?? 1,
    limit: query?.limit ?? 20,
    search: query?.search,
  });
  return { items: items.map(mapEvaluation), meta };
}

export async function createEvaluation(input: {
  name: string;
  totalMarks: number;
  weight: number;
}): Promise<Evaluation> {
  const created = await apiClient<EvaluationDto>("/evaluations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapEvaluation(created);
}

export async function updateEvaluation(
  id: number,
  input: { name?: string; totalMarks?: number; weight?: number },
): Promise<Evaluation> {
  const updated = await apiClient<EvaluationDto>(`/evaluations/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return mapEvaluation(updated);
}

export async function deleteEvaluation(id: number): Promise<void> {
  await apiClient<void>(`/evaluations/${id}`, { method: "DELETE" });
}

export async function fetchGroupEvaluationsPaginated(query?: ListQuery): Promise<PaginatedResult<GroupEvaluation>> {
  const [result, ref] = await Promise.all([
    apiGetPaginated<GroupEvaluationDto>("/evaluations/grades", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search,
      sortBy: query?.sortBy ?? "evaluationDate",
      sortOrder: query?.sortOrder ?? "DESC",
    }),
    fetchReferenceData(),
  ]);
  return {
    items: mapGroupEvaluationList(result.items, ref),
    meta: result.meta,
  };
}

export async function createGroupEvaluation(input: {
  groupId: number;
  evaluationId: number;
  obtainedMarks: number;
  comments?: string;
}): Promise<GroupEvaluation> {
  const [created, ref] = await Promise.all([
    apiClient<GroupEvaluationDto>("/evaluations/group", {
      method: "POST",
      body: JSON.stringify(input),
    }),
    fetchReferenceData(),
  ]);
  return mapGroupEvaluationList([created], ref)[0];
}

export async function updateGroupEvaluation(
  id: number,
  input: { obtainedMarks?: number; comments?: string; isPublished?: boolean },
): Promise<GroupEvaluation> {
  const [updated, ref] = await Promise.all([
    apiClient<GroupEvaluationDto>(`/evaluations/group/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
    fetchReferenceData(),
  ]);
  return mapGroupEvaluationList([updated], ref)[0];
}

export async function fetchEvaluations(query?: ListQuery): Promise<Evaluation[]> {
  const { items } = await apiGetPaginated<EvaluationDto>("/evaluations", {
    page: query?.page ?? 1,
    limit: query?.limit ?? 100,
    search: query?.search,
  });
  return items.map(mapEvaluation);
}

export async function fetchGroupEvaluations(groupId: number): Promise<GroupEvaluation[]> {
  const [items, ref] = await Promise.all([
    apiClient<GroupEvaluationDto[]>(`/evaluations/group/${groupId}`),
    fetchReferenceData(),
  ]);
  return mapGroupEvaluationList(items, ref);
}

export async function fetchAllGroupEvaluations(): Promise<GroupEvaluation[]> {
  const ref = await fetchReferenceData();
  const groupIds = [...ref.groups.keys()];
  if (!groupIds.length) return [];

  const batches = await Promise.all(
    groupIds.map((id) =>
      apiClient<GroupEvaluationDto[]>(`/evaluations/group/${id}`).catch(() => []),
    ),
  );
  return mapGroupEvaluationList(batches.flat(), ref);
}
