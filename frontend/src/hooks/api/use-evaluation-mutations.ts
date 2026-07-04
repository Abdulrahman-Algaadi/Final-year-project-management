"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEvaluation,
  createGroupEvaluation,
  deleteEvaluation,
  updateEvaluation,
  updateGroupEvaluation,
} from "@/lib/api/services/evaluations.service";

export function useEvaluationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const createGrade = useMutation({
    mutationFn: createGroupEvaluation,
    onSuccess: invalidate,
  });

  const createRubric = useMutation({
    mutationFn: createEvaluation,
    onSuccess: invalidate,
  });

  const updateRubric = useMutation({
    mutationFn: ({ id, ...input }: { id: number; name?: string; totalMarks?: number; weight?: number }) =>
      updateEvaluation(id, input),
    onSuccess: invalidate,
  });

  const removeRubric = useMutation({
    mutationFn: deleteEvaluation,
    onSuccess: invalidate,
  });

  const updateGrade = useMutation({
    mutationFn: ({ id, ...input }: { id: number; obtainedMarks?: number; comments?: string; isPublished?: boolean }) =>
      updateGroupEvaluation(id, input),
    onSuccess: invalidate,
  });

  return { createGrade, createRubric, updateRubric, removeRubric, updateGrade };
}
