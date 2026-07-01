import { apiGetPaginated } from "@/lib/api/client";
import { mapStudentList } from "@/lib/api/mappers/student.mapper";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import type { Student } from "@/types";
import type { ListQuery, PaginatedResult, StudentDto } from "@/types/api";

export async function fetchStudents(query?: ListQuery): Promise<Student[]> {
  const result = await fetchStudentsPaginated(query);
  return result.items;
}

export async function fetchStudentsPaginated(query?: ListQuery): Promise<PaginatedResult<Student>> {
  const [result, ref] = await Promise.all([
    apiGetPaginated<StudentDto>("/students", {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search,
    }),
    fetchReferenceData(),
  ]);
  return {
    items: mapStudentList(result.items, ref),
    meta: result.meta,
  };
}
