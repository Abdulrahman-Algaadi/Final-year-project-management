"use client";

import { Calendar, MapPin, Pencil, Video, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/providers/locale-provider";
import { LtrValue } from "@/components/shared/ltr-value";
import { formatDateTime } from "@/lib/utils";
import type { Meeting } from "@/types";

interface MeetingCardProps {
  meeting: Meeting;
  withLabel?: string;
  canCancel?: boolean;
  canEdit?: boolean;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function MeetingCard({ meeting, withLabel = "with", canCancel, canEdit, onCancel, onEdit }: MeetingCardProps) {
  const { t } = useTranslation();
  return (
    <EntityCard
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold tracking-tight">{meeting.groupName}</h3>
              <StatusBadge status={meeting.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{withLabel} {meeting.advisorName}</p>
          </div>
        </div>
      }
      footer={
        (canCancel && meeting.status === "Scheduled") || canEdit ? (
          <CardActions>
            {canEdit && meeting.status === "Scheduled" && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
                <Pencil className="size-3.5 shrink-0" />
                {t("common.edit")}
              </Button>
            )}
            {canCancel && meeting.status === "Scheduled" && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onCancel}>
                <XCircle className="size-3.5 shrink-0" />
                {t("meetings.cancel")}
              </Button>
            )}
          </CardActions>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Calendar className="size-4 shrink-0 text-foreground/70" />
          <LtrValue>{formatDateTime(meeting.meetingDate)}</LtrValue>
        </span>
        {meeting.location && (
          <span className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-foreground/70" />
            {meeting.location}
          </span>
        )}
        {meeting.onlineLink && (
          <span className="flex items-center gap-2">
            <Video className="size-4 shrink-0 text-foreground/70" />
            {t("meetings.online")}
          </span>
        )}
      </div>
      {meeting.notes && <p className="text-sm leading-relaxed">{meeting.notes}</p>}
    </EntityCard>
  );
}
