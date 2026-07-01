"use client";

import { Award, Users, User, Calendar, Eye, EyeOff, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { InfoRow } from "@/components/cards/info-row";
import { LtrValue } from "@/components/shared/ltr-value";
import { useTranslation } from "@/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import type { GroupEvaluation } from "@/types";

interface EvaluationGradeCardProps {
  grade: GroupEvaluation;
  showGroup?: boolean;
  showVisibility?: boolean;
  canManage?: boolean;
  onTogglePublish?: () => void;
  onEdit?: () => void;
}

export function EvaluationGradeCard({
  grade,
  showGroup = true,
  showVisibility = false,
  canManage,
  onTogglePublish,
  onEdit,
}: EvaluationGradeCardProps) {
  const { t } = useTranslation();
  const pct = grade.totalMarks ? Math.round((grade.obtainedMarks / grade.totalMarks) * 100) : 0;

  return (
    <EntityCard
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-semibold leading-snug">{grade.evaluationName}</h3>
              <LtrValue className="mt-1 text-2xl font-bold">
                {grade.obtainedMarks}/{grade.totalMarks}
              </LtrValue>
            </div>
          </div>
          {showVisibility && (
            <Badge variant={grade.isPublished ? "success" : "warning"} className="shrink-0">
              {grade.isPublished ? <Eye className="me-1 size-3 shrink-0" /> : <EyeOff className="me-1 size-3 shrink-0" />}
              {grade.isPublished ? t("evaluations.published") : t("evaluations.hidden")}
            </Badge>
          )}
        </div>
      }
      footer={
        canManage ? (
          <CardActions>
            {onEdit && (
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
                <Pencil className="size-3.5 shrink-0" />
                {t("common.edit")}
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onTogglePublish}>
              {grade.isPublished ? t("evaluations.unpublish") : t("evaluations.publish")}
            </Button>
          </CardActions>
        ) : undefined
      }
    >
      <Progress value={pct} className="h-2" />
      {showGroup && <InfoRow label={t("groups.group")} value={grade.groupName} icon={<Users className="size-3.5" />} />}
      <InfoRow label={t("evaluations.evaluator")} value={grade.evaluatorName} icon={<User className="size-3.5" />} />
      <InfoRow label={t("evaluations.date")} value={formatDate(grade.evaluationDate)} icon={<Calendar className="size-3.5" />} ltr />
    </EntityCard>
  );
}
