"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEvaluationMutations } from "@/hooks/api/use-evaluation-mutations";
import { useTranslation } from "@/providers/locale-provider";
import type { Evaluation } from "@/types";

interface RubricFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rubric?: Evaluation | null;
}

export function RubricFormDialog({ open, onOpenChange, rubric }: RubricFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = rubric != null;
  const [name, setName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [weight, setWeight] = useState("");

  const { createRubric, updateRubric } = useEvaluationMutations();

  useEffect(() => {
    if (!open) return;
    if (rubric) {
      setName(rubric.name);
      setTotalMarks(String(rubric.totalMarks));
      setWeight(String(rubric.weight));
    } else {
      setName("");
      setTotalMarks("");
      setWeight("");
    }
  }, [open, rubric]);

  const handleSubmit = async () => {
    if (!name.trim() || !totalMarks || !weight) {
      toast.error(t("evaluations.rubricRequired"));
      return;
    }
    const payload = {
      name: name.trim(),
      totalMarks: Number(totalMarks),
      weight: Number(weight),
    };
    try {
      if (isEdit && rubric) {
        await updateRubric.mutateAsync({ id: rubric.id, ...payload });
        toast.success(t("evaluations.rubricUpdated"));
      } else {
        await createRubric.mutateAsync(payload);
        toast.success(t("evaluations.rubricCreated"));
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const pending = createRubric.isPending || updateRubric.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("evaluations.editRubric") : t("evaluations.createRubric")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("evaluations.editRubricDesc") : t("evaluations.createRubricDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("evaluations.name")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">{t("evaluations.totalMarks")}</label>
            <Input type="number" min={1} value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">{t("evaluations.weight")} (%)</label>
            <Input type="number" min={0.01} max={100} step={0.01} value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1.5" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="button" onClick={() => void handleSubmit()} loading={pending}>
              {isEdit ? t("common.save") : t("common.create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
