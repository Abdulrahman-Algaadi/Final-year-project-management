"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGroupMember,
  assignGroupProject,
  createGroup,
  deleteGroup,
  removeGroupMember,
  updateGroup,
} from "@/lib/api/services/groups.service";

export function useGroupMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  };

  const addMember = useMutation({
    mutationFn: ({
      groupId,
      studentId,
      statusId,
      isLeader,
    }: {
      groupId: number;
      studentId: number;
      statusId?: number;
      isLeader?: boolean;
    }) => addGroupMember(groupId, { studentId, statusId, isLeader }),
    onSuccess: invalidate,
  });

  const removeMember = useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) =>
      removeGroupMember(groupId, memberId),
    onSuccess: invalidate,
  });

  const assignProject = useMutation({
    mutationFn: ({ groupId, projectId }: { groupId: number; projectId: number }) =>
      assignGroupProject(groupId, projectId),
    onSuccess: invalidate,
  });

  const create = useMutation({
    mutationFn: (groupName: string) => createGroup(groupName),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, groupName }: { id: number; groupName: string }) => updateGroup(id, groupName),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteGroup(id),
    onSuccess: invalidate,
  });

  return { addMember, removeMember, assignProject, create, update, remove };
}
