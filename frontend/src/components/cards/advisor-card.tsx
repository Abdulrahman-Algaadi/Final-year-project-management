"use client";

import { Mail, Building2, Briefcase, DollarSign, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { InfoRow } from "@/components/cards/info-row";
import { useTranslation } from "@/providers/locale-provider";
import type { Advisor } from "@/types";

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

interface AdvisorCardProps {
  advisor: Advisor;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AdvisorCard({ advisor, canManage, onEdit, onDelete }: AdvisorCardProps) {
  const { t } = useTranslation();

  return (
    <EntityCard
      header={
        <div className="flex items-start gap-3">
          <Avatar className="size-11 shrink-0 ring-2 ring-background">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials(advisor.firstName, advisor.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-snug">
              {advisor.firstName} {advisor.lastName}
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="font-normal">
                <Briefcase className="me-1 size-3 shrink-0" />
                {advisor.designation}
              </Badge>
            </div>
          </div>
        </div>
      }
      footer={
        canManage ? (
          <CardActions>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
              <Pencil className="size-3.5 shrink-0" />
              {t("common.edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5 shrink-0" />
              {t("common.delete")}
            </Button>
          </CardActions>
        ) : undefined
      }
    >
      {advisor.email ? (
        <InfoRow label={t("advisors.email")} value={advisor.email} icon={<Mail className="size-3.5" />} ltr />
      ) : null}
      <InfoRow label={t("advisors.department")} value={advisor.department} icon={<Building2 className="size-3.5" />} />
      {advisor.salary !== undefined && advisor.salary !== null ? (
        <InfoRow
          label={t("advisors.salary")}
          value={advisor.salary.toLocaleString()}
          icon={<DollarSign className="size-3.5" />}
          ltr
        />
      ) : null}
    </EntityCard>
  );
}
