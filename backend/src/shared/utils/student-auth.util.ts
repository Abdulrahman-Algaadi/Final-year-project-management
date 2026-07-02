/** Auth helpers for student login via registration number. */

export function normalizeRegistrationNo(registrationNo: string): string {
  return registrationNo.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.');
}

/** Supabase login email when no personal email is provided. */
export function buildStudentAuthEmail(registrationNo: string): string {
  return `student.${normalizeRegistrationNo(registrationNo)}@fypms.auth`;
}

export function defaultStudentUsername(registrationNo: string): string {
  const base = normalizeRegistrationNo(registrationNo).replace(/\./g, '_');
  return base.length >= 3 ? base : `stu_${base}`;
}

export function resolveStudentAuthEmail(registrationNo: string, contactEmail?: string | null): string {
  const trimmed = contactEmail?.trim();
  if (trimmed) {
    return trimmed;
  }
  return buildStudentAuthEmail(registrationNo);
}
