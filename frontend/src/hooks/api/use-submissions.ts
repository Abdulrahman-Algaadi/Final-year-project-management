"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubmission,
  fetchSubmissions,
  fetchSubmissionsByGroup,
  fetchSubmissionsPaginated,
  reviewSubmission,
  uploadSubmissionFile,
} from "@/lib/api/services/submissions.service";
import { useSession } from "@/providers/session-provider";
import type { ListQuery } from "@/types/api";

export function useSubmissions(query?: ListQuery, groupId?: number) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["submissions", query, groupId],
    queryFn: () => (groupId != null ? fetchSubmissionsByGroup(groupId) : fetchSubmissions(query)),
    enabled: !isDemo && (groupId != null || query != null),
  });
}

export function useSubmissionsPaginated(query?: ListQuery, enabled = true) {
  const { isDemo } = useSession();
  return useQuery({
    queryKey: ["submissions", "paginated", query],
    queryFn: () => fetchSubmissionsPaginated(query),
    enabled: !isDemo && enabled,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      title,
      submissionType,
      file,
    }: {
      groupId: number;
      title: string;
      submissionType: string;
      file: File;
    }) => {
      const uploaded = await uploadSubmissionFile(groupId, file);
      return createSubmission({
        groupId,
        title,
        submissionType,
        filePath: uploaded.path,
        fileSize: uploaded.size,
        mimeType: uploaded.mimeType,
        storageBucket: uploaded.storageBucket,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions"] }),
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => reviewSubmission(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions"] }),
  });
}
