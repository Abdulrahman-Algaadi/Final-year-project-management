import type { Notification } from "@/types";
import type { NotificationDto } from "@/types/api";

export function mapNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    isRead: dto.isRead,
    createdAt: typeof dto.createdAt === "string" ? dto.createdAt : new Date(dto.createdAt).toISOString(),
  };
}

export function mapNotificationList(dtos: NotificationDto[]): Notification[] {
  return dtos.map(mapNotification);
}
