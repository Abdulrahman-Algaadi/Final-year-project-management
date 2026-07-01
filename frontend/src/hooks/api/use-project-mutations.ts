"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/api/services/projects.service";

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const create = useMutation({
    mutationFn: createProject,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, ...input }: { id: number; title?: string; description?: string; statusName?: string }) =>
      updateProject(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
