import { getAccessToken } from "@/lib/api/auth-token";
import { env } from "@/lib/env";
import type { ApiResponse, PaginationMeta } from "@/types";
import type { PaginatedResult } from "@/types/api";

const API_URL = env.apiUrl;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiClientOptions = RequestInit & {
  token?: string | null;
  skipAuth?: boolean;
};

async function parseBody<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("Invalid server response", res.status);
  }
}

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { token, skipAuth, headers, ...rest } = options;

  const authToken = skipAuth ? null : (token ?? (await getAccessToken()));

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const body = await parseBody<T>(res);

  if (!res.ok || body.success === false) {
    throw new ApiError(
      body.message ?? "Request failed",
      res.status,
      (body as ApiResponse<T> & { errorCode?: string }).errorCode,
    );
  }

  return body.data as T;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const authToken = await getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: formData,
  });

  const body = await parseBody<T>(res);

  if (!res.ok || body.success === false) {
    throw new ApiError(
      body.message ?? "Upload failed",
      res.status,
      (body as ApiResponse<T> & { errorCode?: string }).errorCode,
    );
  }

  return body.data as T;
}

export async function apiGetAllPaginated<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const result = await apiGetPaginated<T>(path, { ...params, page, limit });
    items.push(...result.items);
    const totalPages = result.meta?.totalPages ?? 1;
    if (page >= totalPages) break;
    page += 1;
  }

  return items;
}

export async function apiGetPaginated<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<PaginatedResult<T>> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
  }
  const qs = query.toString();
  const url = qs ? `${path}?${qs}` : path;

  const authToken = await getAccessToken();
  const res = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  const body = await parseBody<PaginatedResult<T>>(res);

  if (!res.ok || body.success === false) {
    throw new ApiError(
      body.message ?? "Request failed",
      res.status,
      (body as ApiResponse<PaginatedResult<T>> & { errorCode?: string }).errorCode,
    );
  }

  const data = body.data as PaginatedResult<T>;
  const meta = body.meta ?? data.meta;

  return { items: data.items, meta: meta as PaginationMeta };
}
