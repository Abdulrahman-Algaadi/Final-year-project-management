"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMeeting, deleteMeeting, fetchMeetings, fetchMeetingsByGroup, fetchMeetingsPaginated, updateMeeting } from "@/lib/api/services/meetings.service";
import { useApiReady } from "@/hooks/use-api-ready";
import type { ListQuery } from "@/types/api";

export function useMeetings(query?: ListQuery) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["meetings", query],
    queryFn: () => fetchMeetings(query),
    enabled: apiReady,
  });
}

export function useMeetingsByGroup(groupId?: number) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["meetings", "group", groupId],
    queryFn: () => fetchMeetingsByGroup(groupId!),
    enabled: apiReady && !!groupId,
  });
}

export function useMeetingsPaginated(query?: ListQuery, enabled = true) {
  const apiReady = useApiReady();
  return useQuery({
    queryKey: ["meetings", "paginated", query],
    queryFn: () => fetchMeetingsPaginated(query),
    enabled: apiReady && enabled,
  });
}

export function useMeetingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["meetings"] });

  return {
    create: useMutation({ mutationFn: createMeeting, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, ...input }: { id: number; groupId?: number; advisorId?: number; meetingDate?: string; location?: string; onlineLink?: string; notes?: string }) => updateMeeting(id, input), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: deleteMeeting, onSuccess: invalidate }),
  };
}
