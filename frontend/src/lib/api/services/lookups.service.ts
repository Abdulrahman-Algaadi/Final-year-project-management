import { apiClient } from "@/lib/api/client";
import type { LookupDto } from "@/types/api";

export async function fetchLookupsByCategory(category: string): Promise<LookupDto[]> {
  return apiClient<LookupDto[]>(`/lookups/category/${category}`, { skipAuth: true });
}
