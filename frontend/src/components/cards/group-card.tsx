"use client";

import { Users, Crown, FolderKanban, Calendar, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardActions } from "@/components/cards/card-actions";
import { EntityCard } from "@/components/cards/entity-card";
import { InfoRow } from "@/components/cards/info-row";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import type { Group } from "@/types";

interface GroupCardProps {
  group: Group;
  onManage?: () => void;
  actionLabel?: string;
}

export function GroupCard({ group, onManage, actionLabel }: GroupCardProps) {
  const { t } = useTranslation();
  const label = actionLabel ?? t("groups.manage");

  return (
    <EntityCard
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold leading-snug">{group.groupName}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Crown className="size-3.5 shrink-0" />
                {group.leaderName}
              </p>
            </div>
          </div>
          <StatusBadge status={group.status} />
        </div>
      }
      footer={
        onManage ? (
          <CardActions>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onManage}>
              <Settings2 className="size-3.5 shrink-0" />
              {label}
            </Button>
          </CardActions>
        ) : undefined
      }
    >
      <InfoRow label={t("groups.members")} value={group.memberCount} icon={<Users className="size-3.5" />} ltr />
      <InfoRow label={t("groups.project")} value={group.projectTitle ?? "—"} icon={<FolderKanban className="size-3.5" />} />
      <InfoRow label={t("projects.created")} value={formatDate(group.createdOn)} icon={<Calendar className="size-3.5" />} ltr />
    </EntityCard>
  );
}
