"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEvaluationMutations } from "@/hooks/api/use-evaluation-mutations";
import { useSchedulableGroups } from "@/hooks/api/use-schedulable-groups";
import { useEvaluations } from "@/hooks/api/use-evaluations";
import { useTranslation } from "@/providers/locale-provider";

interface RecordGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordGradeDialog({ open, onOpenChange }: RecordGradeDialogProps) {
  const { t } = useTranslation();
  const [groupId, setGroupId] = useState("");
  const [evaluationId, setEvaluationId] = useState("");
  const [obtainedMarks, setObtainedMarks] = useState("");
  const [comments, setComments] = useState("");

  const { createGrade } = useEvaluationMutations();
  const { groups: schedulableGroups } = useSchedulableGroups();
  const { data: apiRubrics } = useEvaluations({ limit: 100 });

  const groups = schedulableGroups;
  const rubrics = apiRubrics ?? [];

  const handleSubmit = async () => {
    if (!groupId || !evaluationId || !obtainedMarks) {
      toast.error(t("evaluations.gradeRequired"));
      return;
    }

    try {
      await createGrade.mutateAsync({
        groupId: Number(groupId),
        evaluationId: Number(evaluationId),
        obtainedMarks: Number(obtainedMarks),
        comments: comments || undefined,
      });
      toast.success(t("evaluations.gradeRecorded"));
      onOpenChange(false);
      setGroupId("");
      setEvaluationId("");
      setObtainedMarks("");
      setComments("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("evaluations.recordGrade")}</DialogTitle>
          <DialogDescription>{t("evaluations.recordGradeDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("groups.group")}</label>
            <Select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="mt-1.5">
              <option value="">{t("groups.selectGroup")}</option>
              {(groups ?? []).map((g) => (
                <option key={g.id} value={g.id}>{g.groupName}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t("evaluations.evaluation")}</label>
            <Select value={evaluationId} onChange={(e) => setEvaluationId(e.target.value)} className="mt-1.5">
              <option value="">{t("evaluations.selectRubric")}</option>
              {rubrics.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.totalMarks})</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t("evaluations.marks")}</label>
            <Input
              type="number"
              min={0}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="button" onClick={() => void handleSubmit()} loading={createGrade.isPending}>{t("common.save")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
