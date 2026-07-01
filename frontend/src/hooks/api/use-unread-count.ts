"use client";

import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useUnreadNotifications } from "@/hooks/api/use-notifications";

export function useUnreadCount(): number {
  const { isDemo } = useSession();
  const { notifications } = useAppData();
  const { data: unreadNotifications } = useUnreadNotifications();

  if (isDemo) {
    return notifications.filter((n) => !n.isRead).length;
  }
  return unreadNotifications?.length ?? 0;
}
