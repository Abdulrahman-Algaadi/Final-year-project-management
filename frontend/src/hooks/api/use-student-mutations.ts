"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudent, updateStudent } from "@/lib/api/services/students.service";
import type { CreateStudentPayload, UpdateStudentPayload } from "@/types/api";

export function useStudentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["reference"] });
  };

  return {
    create: useMutation({
      mutationFn: (input: CreateStudentPayload) => createStudent(input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...input }: UpdateStudentPayload & { id: number }) => updateStudent(id, input),
      onSuccess: invalidate,
    }),
  };
}
