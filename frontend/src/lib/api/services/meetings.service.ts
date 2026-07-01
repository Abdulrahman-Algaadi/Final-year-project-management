import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { mapMeetingList } from "@/lib/api/mappers/meeting.mapper";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import type { Meeting } from "@/types";
import type { ListQuery, MeetingDto, PaginatedResult } from "@/types/api";

export async function fetchMeetingsByGroup(groupId: number): Promise<Meeting[]> {
  const ref = await fetchReferenceData();
  const data = await apiClient<MeetingDto[]>(`/meetings/group/${groupId}`);
  return mapMeetingList(data, ref);
}

export async function fetchMeetingsPaginated(query?: ListQuery): Promise<PaginatedResult<Meeting>> {
  const [result, ref] = await Promise.all([
    apiGetPaginated<MeetingDto>("/meetings", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search,
      sortBy: query?.sortBy ?? "meetingDate",
      sortOrder: query?.sortOrder ?? "DESC",
    }),
    fetchReferenceData(),
  ]);
  return {
    items: mapMeetingList(result.items, ref),
    meta: result.meta,
  };
}

export async function fetchMeetings(query?: ListQuery): Promise<Meeting[]> {
  const result = await fetchMeetingsPaginated(query);
  return result.items;
}

export async function createMeeting(input: {
  groupId: number;
  advisorId: number;
  meetingDate: string;
  location?: string;
  onlineLink?: string;
  notes?: string;
}): Promise<Meeting> {
  const ref = await fetchReferenceData();
  const created = await apiClient<MeetingDto>("/meetings", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapMeetingList([created], ref)[0];
}

export async function deleteMeeting(id: number): Promise<void> {
  await apiClient<void>(`/meetings/${id}`, { method: "DELETE" });
}

export async function updateMeeting(
  id: number,
  input: {
    groupId?: number;
    advisorId?: number;
    meetingDate?: string;
    location?: string;
    onlineLink?: string;
    notes?: string;
  },
): Promise<Meeting> {
  const ref = await fetchReferenceData();
  const updated = await apiClient<MeetingDto>(`/meetings/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return mapMeetingList([updated], ref)[0];
}
