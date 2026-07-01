export type UserRole = "Admin" | "Advisor" | "Student" | "Coordinator";

export interface UserProfile {
  id: number;
  personId: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
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
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  semesterId: number;
  semesterName?: string;
  statusId: number;
  statusName: string;
  department?: string;
  createdAt: string;
}

export interface Student {
  id: number;
  registrationNo: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  semester: string;
  enrollmentYear: number;
  status: string;
}

export interface Group {
  id: number;
  groupName: string;
  memberCount: number;
  leaderName: string;
  projectTitle?: string;
  status: string;
  createdOn: string;
}

export interface Submission {
  id: number;
  groupId: number;
  groupName: string;
  title: string;
  submissionType: string;
  status: string;
  versionNo: number;
  submittedAt: string;
  filePath: string;
}

export interface Evaluation {
  id: number;
  name: string;
  totalMarks: number;
  weight: number;
}

export interface GroupEvaluation {
  id: number;
  groupId: number;
  groupName: string;
  evaluationName: string;
  obtainedMarks: number;
  totalMarks: number;
  isPublished: boolean;
  evaluationDate: string;
  evaluatorName: string;
  comments?: string;
}

export interface Meeting {
  id: number;
  groupId: number;
  groupName: string;
  advisorName: string;
  meetingDate: string;
  location?: string;
  onlineLink?: string;
  status: string;
  notes?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  studentCount: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
}
