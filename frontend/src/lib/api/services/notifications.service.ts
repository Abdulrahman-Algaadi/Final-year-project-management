import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { mapNotification, mapNotificationList } from "@/lib/api/mappers/notification.mapper";
import type { Notification } from "@/types";
import type { ListQuery, NotificationDto, PaginatedResult } from "@/types/api";

export async function fetchMyNotificationsPaginated(query?: ListQuery): Promise<PaginatedResult<Notification>> {
  const { items, meta } = await apiGetPaginated<NotificationDto>("/notifications/me", {
    page: query?.page ?? 1,
    limit: query?.limit ?? 20,
    sortBy: query?.sortBy ?? "createdAt",
    sortOrder: query?.sortOrder ?? "DESC",
  });
  return { items: mapNotificationList(items), meta };
}

export async function fetchMyNotifications(): Promise<Notification[]> {
  const result = await fetchMyNotificationsPaginated({ limit: 100 });
  return result.items;
}

export async function fetchMyUnreadNotifications(): Promise<Notification[]> {
  const data = await apiClient<NotificationDto[]>("/notifications/me/unread");
  return mapNotificationList(data);
}

export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  return apiClient<{ updated: number }>("/notifications/me/read-all", { method: "PATCH" });
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const data = await apiClient<NotificationDto>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
  return mapNotification(data);
}
