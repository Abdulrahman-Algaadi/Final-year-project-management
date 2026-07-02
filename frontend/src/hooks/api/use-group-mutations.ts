"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGroupMember,
  assignGroupAdvisor,
  assignGroupProject,
  createGroup,
  deleteGroup,
  removeGroupAdvisor,
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
      isLeader,
    }: {
      groupId: number;
      studentId: number;
      isLeader?: boolean;
    }) => addGroupMember(groupId, { studentId, isLeader }),
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

  const assignAdvisor = useMutation({
    mutationFn: ({
      groupId,
      advisorId,
      advisorRoleId,
    }: {
      groupId: number;
      advisorId: number;
      advisorRoleId?: number;
    }) => assignGroupAdvisor(groupId, { advisorId, advisorRoleId }),
    onSuccess: invalidate,
  });

  const removeAdvisor = useMutation({
    mutationFn: ({ groupId, assignmentId }: { groupId: number; assignmentId: number }) =>
      removeGroupAdvisor(groupId, assignmentId),
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

  return { addMember, removeMember, assignProject, assignAdvisor, removeAdvisor, create, update, remove };
}
