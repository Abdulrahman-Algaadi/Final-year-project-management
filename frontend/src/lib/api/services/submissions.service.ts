import { apiClient, apiGetPaginated, apiUpload } from "@/lib/api/client";
import { mapSubmissionList } from "@/lib/api/mappers/submission.mapper";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import type { Submission } from "@/types";
import type { ListQuery, PaginatedResult, SubmissionDto } from "@/types/api";

export interface SubmissionUploadResult {
  path: string;
  size: number;
  mimeType: string;
  storageBucket: string;
}

export async function fetchSubmissions(query?: ListQuery): Promise<Submission[]> {
  const result = await fetchSubmissionsPaginated(query);
  return result.items;
}

export async function fetchSubmissionsPaginated(query?: ListQuery): Promise<PaginatedResult<Submission>> {
  const [result, ref] = await Promise.all([
    apiGetPaginated<SubmissionDto>("/submissions", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search,
      sortBy: query?.sortBy ?? "submittedAt",
      sortOrder: query?.sortOrder ?? "DESC",
    }),
    fetchReferenceData(),
  ]);
  return {
    items: mapSubmissionList(result.items, ref),
    meta: result.meta,
  };
}

export async function fetchSubmissionsByGroup(groupId: number): Promise<Submission[]> {
  const [items, ref] = await Promise.all([
    apiClient<SubmissionDto[]>(`/submissions/group/${groupId}`),
    fetchReferenceData(),
  ]);
  return mapSubmissionList(items, ref);
}

export async function uploadSubmissionFile(groupId: number, file: File): Promise<SubmissionUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("groupId", String(groupId));
  return apiUpload<SubmissionUploadResult>("/submissions/upload", formData);
}

export async function createSubmission(input: {
  groupId: number;
  title: string;
  filePath: string;
  submissionType?: string;
  fileSize?: number;
  mimeType?: string;
  storageBucket?: string;
}): Promise<Submission> {
  const ref = await fetchReferenceData();
  const created = await apiClient<SubmissionDto>("/submissions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapSubmissionList([created], ref)[0];
}

export async function getSubmissionDownloadUrl(id: number): Promise<string> {
  const result = await apiClient<{ url: string; fileName: string }>(`/submissions/${id}/download`);
  return result.url;
}

export async function reviewSubmission(id: number, status: string): Promise<Submission> {
  const ref = await fetchReferenceData();
  const updated = await apiClient<SubmissionDto>(`/submissions/${id}/review`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return mapSubmissionList([updated], ref)[0];
}
