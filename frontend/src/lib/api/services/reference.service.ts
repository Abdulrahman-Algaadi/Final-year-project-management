import { apiClient } from "@/lib/api/client";
import type { GroupDto, ReferenceData } from "@/types/api";

interface ReferenceResponse {
  departments: { id: number; name: string; code: string }[];
  semesters: { id: number; name: string }[];
  students: { id: number; firstName: string; lastName: string; email: string; registrationNo: string }[];
  projects: { id: number; title: string }[];
  groups: { id: number; groupName: string }[];
  evaluations: { id: number; name: string; totalMarks: number }[];
  advisors: { id: number; firstName: string; lastName: string }[];
}

const REFERENCE_TTL_MS = 5 * 60_000;

let cached: ReferenceData | null = null;
let expiresAt = 0;
let inflight: Promise<ReferenceData> | null = null;

function mapReference(data: ReferenceResponse): ReferenceData {
  return {
    departments: new Map(data.departments.map((d) => [d.id, { name: d.name, code: d.code }])),
    semesters: new Map(data.semesters.map((s) => [s.id, s.name])),
    students: new Map(
      data.students.map((s) => [
        s.id,
        { firstName: s.firstName, lastName: s.lastName, email: s.email, registrationNo: s.registrationNo },
      ]),
    ),
    projects: new Map(data.projects.map((p) => [p.id, { title: p.title }])),
    groups: new Map(data.groups.map((g) => [g.id, { groupName: g.groupName }])),
    evaluations: new Map(data.evaluations.map((e) => [e.id, { name: e.name, totalMarks: e.totalMarks }])),
    advisors: new Map(
      data.advisors.map((a) => [a.id, { firstName: a.firstName, lastName: a.lastName }]),
    ),
  };
}

async function loadReferenceFromApi(): Promise<ReferenceData> {
  const data = await apiClient<ReferenceResponse>("/reference");
  return mapReference(data);
}

/** Cached reference lookup — one network call per session window. */
export async function fetchReferenceData(): Promise<ReferenceData> {
  if (cached && Date.now() < expiresAt) {
    return cached;
  }
  if (inflight) {
    return inflight;
  }

  inflight = loadReferenceFromApi()
    .then((data) => {
      cached = data;
      expiresAt = Date.now() + REFERENCE_TTL_MS;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export function invalidateReferenceCache(): void {
  cached = null;
  expiresAt = 0;
  inflight = null;
}

export async function fetchGroupMe(): Promise<GroupDto> {
  return apiClient<GroupDto>("/groups/me");
}
