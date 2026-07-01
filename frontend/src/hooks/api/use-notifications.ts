"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyNotifications,
  fetchMyNotificationsPaginated,
  fetchMyUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/services/notifications.service";
import { useApiReady } from "@/hooks/use-api-ready";

import type { ListQuery } from "@/types/api";

export function useNotifications() {
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["notifications", "me"],
    queryFn: fetchMyNotifications,
    enabled: apiReady,
  });
}

export function useNotificationsPaginated(query?: ListQuery) {
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["notifications", "me", "paginated", query],
    queryFn: () => fetchMyNotificationsPaginated(query),
    enabled: apiReady,
  });
}

export function useUnreadNotifications() {
  const apiReady = useApiReady();

  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchMyUnreadNotifications,
    enabled: apiReady,
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
