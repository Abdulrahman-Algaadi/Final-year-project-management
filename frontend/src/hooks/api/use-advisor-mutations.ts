"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAdvisor,
  deleteAdvisor,
  updateAdvisor,
} from "@/lib/api/services/advisors.service";
import type { CreateAdvisorPayload, UpdateAdvisorPayload } from "@/types/api";

export function useAdvisorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["advisors"] });
    queryClient.invalidateQueries({ queryKey: ["reference"] });
  };

  return {
    create: useMutation({
      mutationFn: (input: CreateAdvisorPayload) => createAdvisor(input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...input }: UpdateAdvisorPayload & { id: number }) => updateAdvisor(id, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => deleteAdvisor(id),
      onSuccess: invalidate,
    }),
  };
}
