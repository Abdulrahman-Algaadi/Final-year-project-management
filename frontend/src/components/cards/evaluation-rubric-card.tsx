"use client";

import { ClipboardList, Target, Scale, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { InfoRow } from "@/components/cards/info-row";
import { useTranslation } from "@/providers/locale-provider";
import type { Evaluation } from "@/types";

interface EvaluationRubricCardProps {
  rubric: Evaluation;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EvaluationRubricCard({ rubric, canManage, onEdit, onDelete }: EvaluationRubricCardProps) {
  const { t } = useTranslation();

  return (
    <EntityCard
      header={
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-semibold leading-snug">{rubric.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t("evaluations.rubricSubtitle")}</p>
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
      <InfoRow label={t("evaluations.totalMarks")} value={rubric.totalMarks} icon={<Target className="size-3.5" />} ltr />
      <InfoRow label={t("evaluations.weight")} value={`${rubric.weight}%`} icon={<Scale className="size-3.5" />} ltr />
    </EntityCard>
  );
}
