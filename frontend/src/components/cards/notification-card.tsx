"use client";

import { Bell } from "lucide-react";
import { EntityCard } from "@/components/cards/entity-card";
import { LtrValue } from "@/components/shared/ltr-value";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { Notification } from "@/types";

interface NotificationCardProps {
  notification: Notification;
  onMarkRead?: () => void;
}

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  return (
    <EntityCard
      className={cn(!notification.isRead && "border-brand-accent/40 bg-success-card-bg")}
      onClick={() => !notification.isRead && onMarkRead?.()}
      header={
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            notification.isRead ? "bg-muted text-muted-foreground" : "bg-brand-accent/15 text-brand-accent",
          )}>
            <Bell className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-snug">{notification.title}</h3>
              {!notification.isRead && <span className="size-2 shrink-0 rounded-full bg-brand-accent" aria-hidden />}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <LtrValue>{formatDateTime(notification.createdAt)}</LtrValue>
            </p>
          </div>
        </div>
      }
    >
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{notification.message}</p>
    </EntityCard>
  );
}
