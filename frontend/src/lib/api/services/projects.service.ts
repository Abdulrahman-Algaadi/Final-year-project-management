import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { DEFAULT_SEMESTER_ID, PROJECT_STATUS_IDS } from "@/lib/api/constants";
import { mapProject, mapProjectList } from "@/lib/api/mappers/project.mapper";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import type { Project } from "@/types";
import type { CreateProjectDto, ListQuery, PaginatedResult, ProjectDto } from "@/types/api";

export async function fetchProjects(query?: ListQuery): Promise<Project[]> {
  const result = await fetchProjectsPaginated(query);
  return result.items;
}

export async function fetchProjectsPaginated(query?: ListQuery): Promise<PaginatedResult<Project>> {
  const [result, ref] = await Promise.all([
    apiGetPaginated<ProjectDto>("/projects", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search,
      sortBy: query?.sortBy ?? "id",
      sortOrder: query?.sortOrder ?? "DESC",
    }),
    fetchReferenceData(),
  ]);
  return {
    items: mapProjectList(result.items, ref),
    meta: result.meta,
  };
}

export async function createProject(input: {
  title: string;
  description?: string;
  statusName: string;
  semesterId?: number;
}): Promise<Project> {
  const ref = await fetchReferenceData();
  const dto: CreateProjectDto = {
    title: input.title,
    description: input.description,
    semesterId: input.semesterId ?? DEFAULT_SEMESTER_ID,
    statusId: PROJECT_STATUS_IDS[input.statusName] ?? 1,
  };
  const created = await apiClient<ProjectDto>("/projects", {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return mapProject(created, ref);
}

export async function updateProject(
  id: number,
  input: { title?: string; description?: string; statusName?: string; semesterId?: number },
): Promise<Project> {
  const ref = await fetchReferenceData();
  const body: Partial<CreateProjectDto> = {};
  if (input.title) body.title = input.title;
  if (input.description !== undefined) body.description = input.description;
  if (input.semesterId !== undefined) body.semesterId = input.semesterId;
  if (input.statusName) body.statusId = PROJECT_STATUS_IDS[input.statusName];

  const updated = await apiClient<ProjectDto>(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapProject(updated, ref);
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient<void>(`/projects/${id}`, { method: "DELETE" });
}
