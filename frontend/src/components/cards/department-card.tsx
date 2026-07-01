"use client";

import { Building2, Users, Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { InfoRow } from "@/components/cards/info-row";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import type { Department } from "@/types";

interface DepartmentCardProps {
  department: Department;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DepartmentCard({ department, canManage, onEdit, onDelete }: DepartmentCardProps) {
  const { t } = useTranslation();

  return (
    <EntityCard
      header={
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-snug">{department.name}</h3>
            <Badge variant="outline" className="mt-1.5 font-mono text-xs">
              {department.code}
            </Badge>
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
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="size-3.5 shrink-0" />
              {t("common.delete")}
            </Button>
          </CardActions>
        ) : undefined
      }
    >
      <InfoRow label={t("departments.students")} value={department.studentCount} icon={<Users className="size-3.5" />} ltr />
      <InfoRow label={t("projects.created")} value={formatDate(department.createdAt)} icon={<Calendar className="size-3.5" />} ltr />
    </EntityCard>
  );
}
