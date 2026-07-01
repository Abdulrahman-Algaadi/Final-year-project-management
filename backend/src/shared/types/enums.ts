export enum UserRole {
  Admin = 'Admin',
  Advisor = 'Advisor',
  Student = 'Student',
  Coordinator = 'Coordinator',
}

export enum ProjectStatusName {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Archived = 'Archived',
}

export enum SubmissionType {
  Proposal = 'Proposal',
  ProgressReport = 'ProgressReport',
  FinalReport = 'FinalReport',
  Presentation = 'Presentation',
  Other = 'Other',
}

export enum SubmissionStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  RevisionRequired = 'RevisionRequired',
}

export enum MeetingStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rescheduled = 'Rescheduled',
}

export enum LookupCategory {
  Gender = 'Gender',
  AdvisorRole = 'AdvisorRole',
  Designation = 'Designation',
  StudentStatus = 'StudentStatus',
}

export enum AuditActionType {
  Insert = 'INSERT',
  Update = 'UPDATE',
  Delete = 'DELETE',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
}

export enum Permission {
  // Department
  DepartmentCreate = 'department:create',
  DepartmentRead = 'department:read',
  DepartmentUpdate = 'department:update',
  DepartmentDelete = 'department:delete',
  // Student
  StudentCreate = 'student:create',
  StudentRead = 'student:read',
  StudentReadOwn = 'student:read:own',
  StudentUpdate = 'student:update',
  StudentDelete = 'student:delete',
  // Advisor
  AdvisorCreate = 'advisor:create',
  AdvisorRead = 'advisor:read',
  AdvisorUpdate = 'advisor:update',
  AdvisorDelete = 'advisor:delete',
  // Project
  ProjectCreate = 'project:create',
  ProjectRead = 'project:read',
  ProjectUpdate = 'project:update',
  ProjectDelete = 'project:delete',
  // Group
  GroupCreate = 'group:create',
  GroupRead = 'group:read',
  GroupReadOwn = 'group:read:own',
  GroupUpdate = 'group:update',
  GroupDelete = 'group:delete',
  // Evaluation
  EvaluationCreate = 'evaluation:create',
  EvaluationRead = 'evaluation:read',
  EvaluationUpdate = 'evaluation:update',
  EvaluationDelete = 'evaluation:delete',
  EvaluationPublish = 'evaluation:publish',
  // Submission
  SubmissionCreate = 'submission:create',
  SubmissionRead = 'submission:read',
  SubmissionApprove = 'submission:approve',
  SubmissionDelete = 'submission:delete',
  // Meeting
  MeetingCreate = 'meeting:create',
  MeetingRead = 'meeting:read',
  MeetingUpdate = 'meeting:update',
  MeetingDelete = 'meeting:delete',
  // Notification
  NotificationRead = 'notification:read',
  NotificationReadOwn = 'notification:read:own',
  // Dashboard
  DashboardStudent = 'dashboard:student',
  DashboardAdvisor = 'dashboard:advisor',
  DashboardAdmin = 'dashboard:admin',
  // Audit & Reports
  AuditRead = 'audit:read',
  ReportRead = 'report:read',
  // User management
  UserManage = 'user:manage',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: Object.values(Permission),
  [UserRole.Coordinator]: Object.values(Permission),
  [UserRole.Advisor]: [
    Permission.AdvisorRead,
    Permission.StudentRead,
    Permission.ProjectRead,
    Permission.ProjectUpdate,
    Permission.GroupRead,
    Permission.EvaluationCreate,
    Permission.EvaluationRead,
    Permission.EvaluationUpdate,
    Permission.EvaluationPublish,
    Permission.SubmissionRead,
    Permission.SubmissionApprove,
    Permission.MeetingCreate,
    Permission.MeetingRead,
    Permission.MeetingUpdate,
    Permission.MeetingDelete,
    Permission.NotificationReadOwn,
    Permission.DashboardAdvisor,
  ],
  [UserRole.Student]: [
    Permission.StudentReadOwn,
    Permission.GroupReadOwn,
    Permission.ProjectRead,
    Permission.SubmissionCreate,
    Permission.SubmissionRead,
    Permission.EvaluationRead,
    Permission.MeetingRead,
    Permission.NotificationReadOwn,
    Permission.DashboardStudent,
  ],
};
