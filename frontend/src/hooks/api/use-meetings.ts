"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMeeting, deleteMeeting, fetchMeetings, fetchMeetingsByGroup, fetchMeetingsPaginated, updateMeeting } from "@/lib/api/services/meetings.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useMeetings(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["meetings", query],
    queryFn: () => fetchMeetings(query),
    enabled: !isDemo,
  });
}

export function useMeetingsByGroup(groupId?: number) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["meetings", "group", groupId],
    queryFn: () => fetchMeetingsByGroup(groupId!),
    enabled: !isDemo && !!groupId,
  });
}

export function useMeetingsPaginated(query?: ListQuery, enabled = true) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["meetings", "paginated", query],
    queryFn: () => fetchMeetingsPaginated(query),
    enabled: !isDemo && enabled,
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
