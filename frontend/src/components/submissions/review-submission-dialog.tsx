"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/providers/locale-provider";
import type { Submission } from "@/types";

export type ReviewStatus = "Approved" | "Rejected" | "RevisionRequired";

interface ReviewSubmissionDialogProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: (status: ReviewStatus) => void;
  loading?: boolean;
}

export function ReviewSubmissionDialog({
  submission,
  open,
  onOpenChange,
  onReview,
  loading,
}: ReviewSubmissionDialogProps) {
  const { t } = useTranslation();

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("submissions.reviewTitle")}</DialogTitle>
          <DialogDescription>{t("submissions.reviewDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{submission.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{submission.groupName}</p>
              </div>
              <StatusBadge status={submission.status} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              className="gap-2"
              onClick={() => onReview("Approved")}
              loading={loading}
            >
              <Check className="size-4" /> {t("common.approve")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => onReview("RevisionRequired")}
              loading={loading}
            >
              <RotateCcw className="size-4" /> {t("submissions.requestRevision")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => onReview("Rejected")}
              loading={loading}
            >
              <X className="size-4" /> {t("common.reject")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
