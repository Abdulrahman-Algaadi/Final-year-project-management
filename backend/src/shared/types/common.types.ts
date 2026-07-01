export interface AuthenticatedUser {
  authUserId: string;
  userAccountId: number;
  personId: number;
  role: string;
  email: string;
  username: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  timestamp: string;
  requestId?: string;
  details?: unknown;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeDeleted?: boolean;
}
