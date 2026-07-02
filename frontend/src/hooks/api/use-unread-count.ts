"use client";

import { useUnreadNotifications } from "@/hooks/api/use-notifications";

export function useUnreadCount(): number {
  const { data: unreadNotifications } = useUnreadNotifications();
  return unreadNotifications?.length ?? 0;
}
