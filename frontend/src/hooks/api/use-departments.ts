"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "@/lib/api/services/departments.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useDepartments(query?: ListQuery) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["departments", query],
    queryFn: () => fetchDepartments(query),
    enabled: !isDemo,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDepartmentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["departments"] });

  return {
    create: useMutation({ mutationFn: createDepartment, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...input }: { id: number; name?: string; code?: string }) =>
        updateDepartment(id, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteDepartment, onSuccess: invalidate }),
  };
}
