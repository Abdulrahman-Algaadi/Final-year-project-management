import type {
  Department,
  Evaluation,
  Group,
  GroupEvaluation,
  Meeting,
  Notification,
  Project,
  Student,
  Submission,
} from "@/types";

export const MOCK_PROJECTS: Project[] = [
  { id: 1, title: "AI-Powered Attendance System", description: "Face recognition attendance using deep learning", semesterId: 1, semesterName: "Semester 8", statusId: 4, statusName: "Ongoing", department: "Computer Science", createdAt: "2025-09-01" },
  { id: 2, title: "Smart Campus Navigation App", description: "Indoor navigation for university buildings", semesterId: 1, semesterName: "Semester 8", statusId: 2, statusName: "Approved", department: "Information Technology", createdAt: "2025-09-05" },
  { id: 3, title: "IoT Energy Monitoring Platform", description: "Real-time energy usage across campus", semesterId: 1, semesterName: "Semester 8", statusId: 1, statusName: "Pending", department: "Electrical Engineering", createdAt: "2025-09-10" },
  { id: 4, title: "Blockchain Certificate Verification", description: "Tamper-proof academic credentials", semesterId: 1, semesterName: "Semester 8", statusId: 6, statusName: "Completed", department: "Computer Science", createdAt: "2024-09-01" },
  { id: 5, title: "Automated Library Management", description: "RFID-based book tracking system", semesterId: 1, semesterName: "Semester 8", statusId: 4, statusName: "Ongoing", department: "Software Engineering", createdAt: "2025-09-15" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 1, registrationNo: "CS-2021-001", firstName: "Ahmed", lastName: "Khan", email: "ahmed.k@university.edu", department: "Computer Science", semester: "Semester 8", enrollmentYear: 2021, status: "Active" },
  { id: 2, registrationNo: "CS-2021-014", firstName: "Sara", lastName: "Malik", email: "sara.m@university.edu", department: "Computer Science", semester: "Semester 8", enrollmentYear: 2021, status: "Active" },
  { id: 3, registrationNo: "IT-2021-008", firstName: "Omar", lastName: "Hassan", email: "omar.h@university.edu", department: "Information Technology", semester: "Semester 8", enrollmentYear: 2021, status: "Active" },
  { id: 4, registrationNo: "EE-2020-022", firstName: "Fatima", lastName: "Ali", email: "fatima.a@university.edu", department: "Electrical Engineering", semester: "Semester 8", enrollmentYear: 2020, status: "Graduated" },
  { id: 5, registrationNo: "SE-2021-003", firstName: "Usman", lastName: "Raza", email: "usman.r@university.edu", department: "Software Engineering", semester: "Semester 8", enrollmentYear: 2021, status: "Inactive" },
];

export const MOCK_GROUPS: Group[] = [
  { id: 1, groupName: "Team Alpha", memberCount: 4, leaderName: "Ahmed Khan", projectTitle: "AI-Powered Attendance System", status: "Active", createdOn: "2025-09-01" },
  { id: 2, groupName: "Team Beta", memberCount: 3, leaderName: "Omar Hassan", projectTitle: "Smart Campus Navigation App", status: "Active", createdOn: "2025-09-05" },
  { id: 3, groupName: "Team Gamma", memberCount: 4, leaderName: "Sara Malik", projectTitle: "IoT Energy Monitoring Platform", status: "Active", createdOn: "2025-09-10" },
  { id: 4, groupName: "Team Delta", memberCount: 2, leaderName: "Usman Raza", projectTitle: "Automated Library Management", status: "Active", createdOn: "2025-09-15" },
];

export interface DemoGroupMember {
  id: number;
  studentId: number;
  studentName: string;
  isLeader: boolean;
}

export const MOCK_GROUP_MEMBERS: Record<number, DemoGroupMember[]> = {
  1: [
    { id: 1, studentId: 1, studentName: "Ahmed Khan", isLeader: true },
    { id: 2, studentId: 2, studentName: "Sara Malik", isLeader: false },
  ],
  2: [
    { id: 3, studentId: 3, studentName: "Omar Hassan", isLeader: true },
  ],
  3: [
    { id: 4, studentId: 2, studentName: "Sara Malik", isLeader: true },
  ],
  4: [
    { id: 5, studentId: 5, studentName: "Usman Raza", isLeader: true },
  ],
};

export const MOCK_GROUP_PROJECT_IDS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
};

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: 1, groupId: 1, groupName: "Team Alpha", title: "Project Proposal", submissionType: "Proposal", status: "Approved", versionNo: 1, submittedAt: "2025-10-01T10:00:00Z", filePath: "/submissions/proposal-v1.pdf" },
  { id: 2, groupId: 1, groupName: "Team Alpha", title: "Progress Report Q1", submissionType: "ProgressReport", status: "Pending", versionNo: 1, submittedAt: "2026-01-15T14:30:00Z", filePath: "/submissions/progress-v1.pdf" },
  { id: 3, groupId: 2, groupName: "Team Beta", title: "Final Report", submissionType: "FinalReport", status: "RevisionRequired", versionNo: 2, submittedAt: "2026-02-20T09:00:00Z", filePath: "/submissions/final-v2.pdf" },
  { id: 4, groupId: 3, groupName: "Team Gamma", title: "Presentation Slides", submissionType: "Presentation", status: "Approved", versionNo: 1, submittedAt: "2026-03-01T16:00:00Z", filePath: "/submissions/slides-v1.pptx" },
];

export const MOCK_EVALUATIONS: Evaluation[] = [
  { id: 1, name: "Proposal Defense", totalMarks: 20, weight: 15 },
  { id: 2, name: "Mid-Term Progress", totalMarks: 30, weight: 25 },
  { id: 3, name: "Final Presentation", totalMarks: 30, weight: 30 },
  { id: 4, name: "Final Report", totalMarks: 20, weight: 30 },
];

export const MOCK_GROUP_EVALUATIONS: GroupEvaluation[] = [
  { id: 1, groupId: 1, groupName: "Team Alpha", evaluationName: "Proposal Defense", obtainedMarks: 17, totalMarks: 20, isPublished: true, evaluationDate: "2025-11-01", evaluatorName: "Dr. Sarah Ahmed" },
  { id: 2, groupId: 1, groupName: "Team Alpha", evaluationName: "Mid-Term Progress", obtainedMarks: 24, totalMarks: 30, isPublished: false, evaluationDate: "2026-01-20", evaluatorName: "Dr. Sarah Ahmed" },
  { id: 3, groupId: 2, groupName: "Team Beta", evaluationName: "Proposal Defense", obtainedMarks: 18, totalMarks: 20, isPublished: true, evaluationDate: "2025-11-05", evaluatorName: "Prof. James Wilson" },
];

export const MOCK_MEETINGS: Meeting[] = [
  { id: 1, groupId: 1, groupName: "Team Alpha", advisorName: "Dr. Sarah Ahmed", meetingDate: "2026-03-12T10:00:00Z", location: "Lab 3, CS Building", status: "Scheduled", notes: "Discuss progress report feedback" },
  { id: 2, groupId: 2, groupName: "Team Beta", advisorName: "Prof. James Wilson", meetingDate: "2026-03-13T14:00:00Z", onlineLink: "https://meet.google.com/abc-defg", status: "Scheduled" },
  { id: 3, groupId: 1, groupName: "Team Alpha", advisorName: "Dr. Sarah Ahmed", meetingDate: "2026-02-28T11:00:00Z", location: "Room 201", status: "Completed", notes: "Reviewed mid-term deliverables" },
  { id: 4, groupId: 3, groupName: "Team Gamma", advisorName: "Dr. Emily Chen", meetingDate: "2026-03-14T09:30:00Z", location: "EE Department", status: "Scheduled" },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: "Computer Science", code: "CS", studentCount: 86, createdAt: "2020-01-01" },
  { id: 2, name: "Information Technology", code: "IT", studentCount: 52, createdAt: "2020-01-01" },
  { id: 3, name: "Electrical Engineering", code: "EE", studentCount: 45, createdAt: "2020-01-01" },
  { id: 4, name: "Software Engineering", code: "SE", studentCount: 38, createdAt: "2021-01-01" },
  { id: 5, name: "Mechanical Engineering", code: "ME", studentCount: 41, createdAt: "2020-01-01" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: "Submission reviewed", message: "Your Progress Report Q1 has been submitted for review.", isRead: false, createdAt: "2026-03-10T08:00:00Z" },
  { id: 2, title: "Meeting scheduled", message: "Dr. Sarah Ahmed scheduled a meeting on Mar 12 at 10:00 AM.", isRead: false, createdAt: "2026-03-09T15:30:00Z" },
  { id: 3, title: "Grade published", message: "Proposal Defense marks are now available.", isRead: true, createdAt: "2025-11-02T10:00:00Z" },
  { id: 4, title: "Advisor assigned", message: "Prof. James Wilson has been assigned as co-supervisor.", isRead: true, createdAt: "2025-09-20T12:00:00Z" },
  { id: 5, title: "Project approved", message: "Your project 'AI-Powered Attendance System' has been approved.", isRead: true, createdAt: "2025-09-15T09:00:00Z" },
];

export const PROJECT_STATUSES = ["Pending", "Approved", "Rejected", "Ongoing", "Completed", "Archived"];
export const SUBMISSION_TYPES = ["Proposal", "ProgressReport", "FinalReport", "Presentation", "Other"];
export const SUBMISSION_STATUSES = ["Pending", "Approved", "Rejected", "RevisionRequired"];
export const MEETING_STATUSES = ["Scheduled", "Completed", "Cancelled", "Rescheduled"];
