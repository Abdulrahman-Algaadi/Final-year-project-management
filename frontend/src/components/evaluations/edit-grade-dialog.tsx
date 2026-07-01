"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEvaluationMutations } from "@/hooks/api/use-evaluation-mutations";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import type { GroupEvaluation } from "@/types";

interface EditGradeDialogProps {
  grade: GroupEvaluation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGradeDialog({ grade, open, onOpenChange }: EditGradeDialogProps) {
  const { t } = useTranslation();
  const { isDemo } = useSession();
  const { updateGrade: updateDemoGrade } = useAppData();
  const [obtainedMarks, setObtainedMarks] = useState("");
  const [comments, setComments] = useState("");

  const { updateGrade } = useEvaluationMutations();

  useEffect(() => {
    if (!grade || !open) return;
    setObtainedMarks(String(grade.obtainedMarks));
    setComments(grade.comments ?? "");
  }, [grade, open]);

  const handleSave = async () => {
    if (!grade || !obtainedMarks) {
      toast.error(t("evaluations.gradeRequired"));
      return;
    }
    const marks = Number(obtainedMarks);
    if (marks < 0 || marks > grade.totalMarks) {
      toast.error(t("evaluations.marksRange", { max: String(grade.totalMarks) }));
      return;
    }
    try {
      if (isDemo) {
        updateDemoGrade(grade.id, { obtainedMarks: marks, comments: comments || undefined });
      } else {
        await updateGrade.mutateAsync({
          id: grade.id,
          obtainedMarks: marks,
          comments: comments || undefined,
        });
      }
      toast.success(t("evaluations.gradeUpdated"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  if (!grade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("evaluations.editGrade")}</DialogTitle>
          <DialogDescription>
            {grade.evaluationName} · {grade.groupName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("evaluations.marks")} (0–{grade.totalMarks})</label>
            <Input
              type="number"
              min={0}
              max={grade.totalMarks}
              value={obtainedMarks}
              onChange={(e) => setObtainedMarks(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("evaluations.comments")}</label>
            <Textarea value={comments} onChange={(e) => setComments(e.target.value)} className="mt-1.5" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => void handleSave()} loading={!isDemo && updateGrade.isPending}>{t("common.save")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
