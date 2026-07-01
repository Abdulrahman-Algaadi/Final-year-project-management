import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { mapGroup, mapGroupList } from "@/lib/api/mappers/group.mapper";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import type { Group } from "@/types";
import type { GroupDto, ListQuery, PaginatedResult } from "@/types/api";

export async function fetchGroups(query?: ListQuery): Promise<Group[]> {
  const result = await fetchGroupsPaginated(query);
  return result.items;
}

export async function fetchGroupsPaginated(query?: ListQuery): Promise<PaginatedResult<Group>> {
  const [result, ref] = await Promise.all([
    apiGetPaginated<GroupDto>("/groups", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search,
      sortBy: query?.sortBy ?? "createdOn",
      sortOrder: query?.sortOrder ?? "DESC",
    }),
    fetchReferenceData(),
  ]);
  return {
    items: mapGroupList(result.items, ref),
    meta: result.meta,
  };
}

export async function fetchGroupById(id: number): Promise<GroupDto> {
  return apiClient<GroupDto>(`/groups/${id}`);
}

export async function createGroup(groupName: string): Promise<GroupDto> {
  return apiClient<GroupDto>("/groups", {
    method: "POST",
    body: JSON.stringify({ groupName }),
  });
}

export async function updateGroup(id: number, groupName: string): Promise<GroupDto> {
  return apiClient<GroupDto>(`/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify({ groupName }),
  });
}

export async function deleteGroup(id: number): Promise<void> {
  await apiClient<void>(`/groups/${id}`, { method: "DELETE" });
}

export async function addGroupMember(
  groupId: number,
  input: { studentId: number; statusId: number; isLeader?: boolean },
): Promise<GroupDto> {
  return apiClient<GroupDto>(`/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function removeGroupMember(groupId: number, memberId: number): Promise<GroupDto> {
  return apiClient<GroupDto>(`/groups/${groupId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export async function assignGroupProject(groupId: number, projectId: number): Promise<GroupDto> {
  return apiClient<GroupDto>(`/groups/${groupId}/project`, {
    method: "POST",
    body: JSON.stringify({ projectId }),
  });
}

export async function fetchGroupDetail(id: number): Promise<Group> {
  const [dto, ref] = await Promise.all([fetchGroupById(id), fetchReferenceData()]);
  return mapGroup(dto, ref);
}
