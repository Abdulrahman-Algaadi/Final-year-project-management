import { apiClient, apiGetPaginated } from "@/lib/api/client";
import { mapStudent, mapStudentList } from "@/lib/api/mappers/student.mapper";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import type { Student } from "@/types";
import type {
  CreateStudentPayload,
  ListQuery,
  PaginatedResult,
  StudentDto,
  UpdateStudentPayload,
} from "@/types/api";

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

export async function createStudent(input: CreateStudentPayload): Promise<Student> {
  const ref = await fetchReferenceData();
  const created = await apiClient<StudentDto>("/students", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapStudent(created, ref);
}

export async function updateStudent(id: number, input: UpdateStudentPayload): Promise<Student> {
  const ref = await fetchReferenceData();
  const updated = await apiClient<StudentDto>(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return mapStudent(updated, ref);
}
