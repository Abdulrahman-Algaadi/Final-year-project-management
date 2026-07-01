"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyNotifications,
  fetchMyNotificationsPaginated,
  fetchMyUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/services/notifications.service";
import { useSession } from "@/providers/session-provider";

import type { ListQuery } from "@/types/api";

export function useNotifications() {
  const { isDemo } = useSession();

  return useQuery({
    queryKey: ["notifications", "me"],
    queryFn: fetchMyNotifications,
    enabled: !isDemo,
  });
}

export function useNotificationsPaginated(query?: ListQuery) {
  const { isDemo } = useSession();

  return useQuery({
    queryKey: ["notifications", "me", "paginated", query],
    queryFn: () => fetchMyNotificationsPaginated(query),
    enabled: !isDemo,
  });
}

export function useUnreadNotifications() {
  const { isDemo } = useSession();

  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchMyUnreadNotifications,
    enabled: !isDemo,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
