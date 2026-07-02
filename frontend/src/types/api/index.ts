import type { PaginationMeta, UserRole } from "@/types";

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface AuthProfileDto {
  userAccountId: number;
  personId: number;
  username: string;
  role: UserRole;
  email?: string;
  firstName?: string;
  lastName?: string;
  lastLogin?: string;
}

export interface LoginCallbackDto {
  profile: AuthProfileDto;
  message: string;
}

export interface ProjectDto {
  id: number;
  title: string;
  description?: string;
  semesterId: number;
  semesterName?: string;
  statusId: number;
  statusName?: string;
  departmentId?: number;
  departmentName?: string;
  createdAt: string;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  semesterId: number;
  statusId: number;
}

export interface StudentDto {
  id: number;
  registrationNo: string;
  departmentId: number;
  semesterId: number;
  enrollmentYear: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface DepartmentDto {
  id: number;
  name: string;
  code: string;
  createdAt: string;
}

export interface SemesterDto {
  id: number;
  name: string;
  academicYear: string;
}

export interface GroupMemberDto {
  id: number;
  studentId: number;
  isLeader: boolean;
  statusId: number;
  assignmentDate: string;
}

export interface GroupProjectDto {
  id: number;
  projectId: number;
  assignedDate: string;
}

export interface GroupDto {
  id: number;
  groupName: string;
  createdOn: string;
  members?: GroupMemberDto[];
  project?: GroupProjectDto;
}

export interface EvaluationDto {
  id: number;
  name: string;
  totalMarks: number;
  weight: number;
}

export interface GroupEvaluationDto {
  id: number;
  groupId: number;
  evaluationId: number;
  obtainedMarks: number;
  evaluationDate: string;
  evaluatedById: number;
  isPublished: boolean;
  comments?: string;
}

export interface SubmissionDto {
  id: number;
  groupId: number;
  title: string;
  filePath: string;
  versionNo: number;
  submittedAt: string;
  submissionType?: string;
  status: string;
}

export interface MeetingDto {
  id: number;
  groupId: number;
  advisorId: number;
  meetingDate: string;
  location?: string;
  notes?: string;
  status: string;
  onlineLink?: string;
}

export interface AdvisorDto {
  id: number;
  departmentId: number;
  designationId: number;
  salary?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface LookupDto {
  id: number;
  category: string;
  value: string;
}

export interface CreateAdvisorPayload {
  email: string;
  password: string;
  departmentId: number;
  designationId: number;
  firstName?: string;
  lastName?: string;
  genderId?: number;
  dateOfBirth?: string;
  contactNo?: string;
  salary?: number;
}

export interface UpdateAdvisorPayload {
  email?: string;
  password?: string;
  departmentId?: number;
  designationId?: number;
  firstName?: string;
  lastName?: string;
  genderId?: number;
  dateOfBirth?: string;
  contactNo?: string;
  salary?: number;
}

export interface NotificationDto {
  id: number;
  personId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminDashboardDto {
  totalProjects: number;
  totalGroups: number;
  totalStudents: number;
  pendingSubmissions: number;
  pendingProjects?: number;
  upcomingMeetings?: number;
  totalAdvisors: number;
  totalDepartments: number;
}

export interface AdvisorDashboardDto {
  assignedProjects: number;
  upcomingMeetings: number;
  pendingSubmissions: number;
  evaluationsPending: number;
}

export interface StudentDashboardDto {
  groupId?: number;
  groupName?: string;
  projectTitle?: string;
  projectStatus?: string;
  departmentName?: string;
  semesterName?: string;
  advisorName?: string;
  advisorEmail?: string;
  advisorDepartment?: string;
  advisorDesignation?: string;
  nextMeetingDate?: string;
  submissionCount: number;
  unreadNotifications: number;
}

export interface ProjectByDepartmentReportDto {
  departmentId: number;
  departmentName: string;
  projectCount: number;
}

export interface EvaluationSummaryReportDto {
  evaluationId: number;
  evaluationName: string;
  groupsEvaluated: number;
  averageMarks: number;
}

export interface ProjectSummaryReportDto {
  totalProjects: number;
  pending: number;
  ongoing: number;
  completed: number;
  archived: number;
}

export interface StudentEnrollmentReportDto {
  departmentId: number;
  departmentName: string;
  studentCount: number;
}

export interface SubmissionSummaryReportDto {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revisionRequired: number;
}

export interface AuditLogDto {
  id: number;
  tableName: string;
  recordId: number;
  actionType: string;
  performedById?: number;
  actionDate: string;
}

export interface StudentLoginResponseDto {
  accessToken: string;
  refreshToken: string;
  profile: AuthProfileDto;
  message: string;
}

export interface CreateStudentPayload {
  registrationNo: string;
  departmentId: number;
  semesterId: number;
  enrollmentYear: number;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  semesterId?: number;
  enrollmentYear?: number;
  password?: string;
}

export interface ReferenceData {
  departments: Map<number, { name: string; code: string }>;
  semesters: Map<number, string>;
  students: Map<number, { firstName?: string; lastName?: string; email?: string; registrationNo: string }>;
  projects: Map<number, { title: string }>;
  groups: Map<number, { groupName: string }>;
  evaluations: Map<number, { name: string; totalMarks: number }>;
  advisors: Map<number, { firstName?: string; lastName?: string }>;
}
