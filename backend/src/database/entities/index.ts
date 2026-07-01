import {
  Department,
  Semester,
  ProjectStatus,
  Lookup,
} from './department.entity';
import { Person } from './person.entity';
import { Student } from './student.entity';
import { Advisor } from './advisor.entity';
import { UserAccount } from './user-account.entity';
import { Project } from './project.entity';
import { StudentGroup } from './student-group.entity';
import { GroupStudent } from './group-student.entity';
import { GroupProject } from './group-project.entity';
import { ProjectAdvisor } from './project-advisor.entity';
import { Evaluation } from './evaluation.entity';
import { GroupEvaluation } from './group-evaluation.entity';
import { Submission } from './submission.entity';
import { Meeting } from './meeting.entity';
import { Notification } from './notification.entity';
import { AuditLog } from './audit-log.entity';

export * from './base.entity';
export * from './department.entity';
export * from './person.entity';
export * from './student.entity';
export * from './advisor.entity';
export * from './user-account.entity';
export * from './project.entity';
export * from './student-group.entity';
export * from './group-student.entity';
export * from './group-project.entity';
export * from './project-advisor.entity';
export * from './evaluation.entity';
export * from './group-evaluation.entity';
export * from './submission.entity';
export * from './meeting.entity';
export * from './notification.entity';
export * from './audit-log.entity';

export const ENTITIES = [
  Department,
  Semester,
  ProjectStatus,
  Lookup,
  Person,
  Student,
  Advisor,
  UserAccount,
  Project,
  StudentGroup,
  GroupStudent,
  GroupProject,
  ProjectAdvisor,
  Evaluation,
  GroupEvaluation,
  Submission,
  Meeting,
  Notification,
  AuditLog,
];
