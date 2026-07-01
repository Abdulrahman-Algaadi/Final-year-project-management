"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { CardCollection } from "@/components/cards/card-collection";
import { NotificationCard } from "@/components/cards/notification-card";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsPaginated, useUnreadNotifications } from "@/hooks/api/use-notifications";
import { PAGE_SIZE } from "@/lib/api/constants";

export default function NotificationsPage() {
  const { isDemo } = useSession();
  const { notifications: mockNotifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const [page, setPage] = useState(1);
  const { data: paginated, isLoading, isError, error, refetch } = useNotificationsPaginated({ page, limit: PAGE_SIZE });
  const { data: unreadList } = useUnreadNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const { t } = useTranslation();

  const notifications = isDemo ? mockNotifications : (paginated?.items ?? []);

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications],
  );

  const unreadCount = isDemo
    ? notifications.filter((n) => !n.isRead).length
    : (unreadList?.length ?? 0);
  const unreadLabel = unreadCount === 1 ? t("notifications.unread") : t("notifications.unreadPlural");

  const handleMarkRead = async (id: number) => {
    if (isDemo) {
      markNotificationRead(id);
      return;
    }
    try {
      await markReadMutation.mutateAsync(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    if (isDemo) {
      markAllNotificationsRead();
      toast.success(t("notifications.markedAll"));
      return;
    }
    try {
      await markAllReadMutation.mutateAsync();
      toast.success(t("notifications.markedAll"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark all as read");
    }
  };

  return (
    <DashboardLayout title={t("nav.notifications")}>
      <div className="space-y-6">
        <PageHeader
          title={t("notifications.title")}
          description={`${unreadCount} ${unreadLabel}`}
          action={
            unreadCount > 0 && (
              <Button variant="outline" className="gap-2" onClick={handleMarkAllRead}>
                <CheckCheck className="size-4" /> {t("notifications.markAllRead")}
              </Button>
            )
          }
        />

        {!isDemo && isLoading ? (
          <TableSkeleton rows={4} />
        ) : !isDemo && isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <CardCollection
            items={sorted}
            keyExtractor={(n) => n.id}
            columns="wide"
            renderCard={(n) => (
              <NotificationCard
                notification={n}
                onMarkRead={() => void handleMarkRead(n.id)}
              />
            )}
            emptyIcon={Bell}
            emptyTitle={t("notifications.none")}
            emptyDescription={t("notifications.caughtUp")}
          />
        )}

        {!isDemo && paginated && (
          <PaginationControls
            page={page}
            totalPages={paginated.meta.totalPages}
            total={paginated.meta.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
