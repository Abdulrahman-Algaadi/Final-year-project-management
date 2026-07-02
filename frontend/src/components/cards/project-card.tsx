"use client";

import { useState } from "react";
import { FolderKanban, Building2, Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { InfoRow } from "@/components/cards/info-row";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const DESCRIPTION_PREVIEW_CHARS = 160;

interface ProjectCardProps {
  project: Project;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({ project, canManage, onEdit, onDelete }: ProjectCardProps) {
  const { t } = useTranslation();
  const [descExpanded, setDescExpanded] = useState(false);
  const description = project.description?.trim();
  const descriptionIsLong = (description?.length ?? 0) > DESCRIPTION_PREVIEW_CHARS;

  return (
    <EntityCard
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold leading-snug break-words">{project.title}</h3>
              {description && (
                <div className="mt-1.5">
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-muted-foreground break-words whitespace-pre-wrap",
                      !descExpanded && descriptionIsLong && "line-clamp-4",
                    )}
                  >
                    {description}
                  </p>
                  {descriptionIsLong && (
                    <button
                      type="button"
                      className="mt-1 text-xs font-medium text-primary hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDescExpanded((current) => !current);
                      }}
                    >
                      {descExpanded ? t("common.showLess") : t("common.showMore")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <StatusBadge status={project.statusName} />
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
      <InfoRow label={t("projects.department")} value={project.department ?? "—"} icon={<Building2 className="size-3.5" />} />
      <InfoRow label={t("projects.semester")} value={project.semesterName ?? "—"} />
      <InfoRow label={t("projects.created")} value={formatDate(project.createdAt)} icon={<Calendar className="size-3.5" />} ltr />
    </EntityCard>
  );
}
