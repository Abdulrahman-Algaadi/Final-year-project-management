"use client";

import { FileText, Users, Check, X, FileDown, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { InfoRow } from "@/components/cards/info-row";
import { LtrValue } from "@/components/shared/ltr-value";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/providers/locale-provider";
import { formatDateTime, getFileName } from "@/lib/utils";
import type { Submission } from "@/types";

interface SubmissionCardProps {
  submission: Submission;
  showGroup?: boolean;
  canReview?: boolean;
  showRevisionHint?: boolean;
  onDownload?: () => void;
  onReview?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function SubmissionCard({
  submission,
  showGroup = true,
  canReview,
  showRevisionHint,
  onDownload,
  onReview,
  onApprove,
  onReject,
}: SubmissionCardProps) {
  const { t } = useTranslation();

  return (
    <EntityCard
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-semibold leading-snug">{submission.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {submission.submissionType}
                {" · "}
                <LtrValue>v{submission.versionNo}</LtrValue>
              </p>
            </div>
          </div>
          <StatusBadge status={submission.status} />
        </div>
      }
      footer={
        <CardActions>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onDownload}>
            <FileDown className="size-3.5 shrink-0" />
            {t("common.download")}
          </Button>
          {canReview && submission.status === "Pending" && (
            onReview ? (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onReview}>
                <ClipboardCheck className="size-3.5 shrink-0" />
                {t("submissions.review")}
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={onApprove}>
                  <Check className="size-3.5 shrink-0" />
                  {t("common.approve")}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={onReject}>
                  <X className="size-3.5 shrink-0" />
                  {t("common.reject")}
                </Button>
              </>
            )
          )}
        </CardActions>
      }
    >
      {showGroup && (
        <InfoRow label={t("groups.group")} value={submission.groupName} icon={<Users className="size-3.5" />} />
      )}
      <InfoRow label={t("submissions.file")} value={getFileName(submission.filePath)} ltr />
      <InfoRow label={t("submissions.submitted")} value={formatDateTime(submission.submittedAt)} ltr />
      {showRevisionHint && submission.status === "RevisionRequired" && (
        <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning-foreground">
          {t("submissions.revisionHint")}
        </p>
      )}
    </EntityCard>
  );
}
