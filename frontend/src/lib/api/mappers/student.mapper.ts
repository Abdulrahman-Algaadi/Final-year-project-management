import type { Student } from "@/types";
import type { ReferenceData, StudentDto } from "@/types/api";

export function mapStudent(dto: StudentDto, ref?: ReferenceData): Student {
  const dept = ref?.departments.get(dto.departmentId);
  return {
    id: dto.id,
    registrationNo: dto.registrationNo,
    firstName: dto.firstName ?? "",
    lastName: dto.lastName ?? "",
    email: dto.email ?? "",
    department: dept?.name ?? "—",
    semester: ref?.semesters.get(dto.semesterId) ?? "—",
    enrollmentYear: dto.enrollmentYear,
    status: "Active",
  };
}

export function mapStudentList(dtos: StudentDto[], ref?: ReferenceData): Student[] {
  return dtos.map((d) => mapStudent(d, ref));
}

export function formatPersonName(
  ref: ReferenceData | undefined,
  personId: number,
): string {
  const student = ref?.students.get(personId);
  if (student) {
    return [student.firstName, student.lastName].filter(Boolean).join(" ") || "—";
  }
  const advisor = ref?.advisors.get(personId);
  if (advisor) {
    return [advisor.firstName, advisor.lastName].filter(Boolean).join(" ") || "—";
  }
  return "—";
}
