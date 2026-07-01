"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { UserProfile, UserRole } from "@/types";
import {
  MOCK_DEPARTMENTS,
  MOCK_EVALUATIONS,
  MOCK_GROUP_EVALUATIONS,
  MOCK_GROUP_MEMBERS,
  MOCK_GROUP_PROJECT_IDS,
  MOCK_GROUPS,
  MOCK_MEETINGS,
  MOCK_NOTIFICATIONS,
  MOCK_PROJECTS,
  MOCK_STUDENTS,
  MOCK_SUBMISSIONS,
  type DemoGroupMember,
} from "@/lib/data/mock-data";
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

interface AppDataContextValue {
  projects: Project[];
  students: Student[];
  groups: Group[];
  submissions: Submission[];
  evaluations: Evaluation[];
  groupEvaluations: GroupEvaluation[];
  meetings: Meeting[];
  departments: Department[];
  notifications: Notification[];
  getDemoGroupMembers: (groupId: number) => DemoGroupMember[];
  getDemoGroupProjectId: (groupId: number) => number | undefined;
  addProject: (p: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: number, p: Partial<Project>) => void;
  deleteProject: (id: number) => void;
  addSubmission: (s: Omit<Submission, "id" | "submittedAt" | "versionNo" | "status">) => void;
  reviewSubmission: (id: number, status: string) => void;
  addMeeting: (m: Omit<Meeting, "id">) => void;
  updateMeeting: (id: number, m: Partial<Meeting>) => void;
  cancelMeeting: (id: number) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  addDepartment: (d: Omit<Department, "id" | "createdAt" | "studentCount">) => void;
  updateDepartment: (id: number, d: Partial<Pick<Department, "name" | "code">>) => void;
  deleteDepartment: (id: number) => void;
  createGroup: (groupName: string) => Group;
  updateGroup: (id: number, groupName: string) => void;
  deleteGroup: (id: number) => void;
  addGroupMember: (groupId: number, studentId: number) => void;
  removeGroupMember: (groupId: number, memberId: number) => void;
  assignGroupProject: (groupId: number, projectId: number) => void;
  getDemoGroupForStudent: (studentId: number) => Group | undefined;
  createRubric: (input: Omit<Evaluation, "id">) => void;
  updateRubric: (id: number, input: Partial<Evaluation>) => void;
  deleteRubric: (id: number) => void;
  createGrade: (input: Omit<GroupEvaluation, "id" | "evaluationDate">) => void;
  updateGrade: (id: number, input: Partial<GroupEvaluation>) => void;
  toggleGradePublish: (id: number) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [students] = useState(MOCK_STUDENTS);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [groupMembers, setGroupMembers] = useState(MOCK_GROUP_MEMBERS);
  const [groupProjectIds, setGroupProjectIds] = useState(MOCK_GROUP_PROJECT_IDS);
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [evaluations, setEvaluations] = useState(MOCK_EVALUATIONS);
  const [groupEvaluations, setGroupEvaluations] = useState(MOCK_GROUP_EVALUATIONS);
  const [meetings, setMeetings] = useState(MOCK_MEETINGS);
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const syncGroupMeta = useCallback((groupId: number, members: DemoGroupMember[], projectId?: number) => {
    const leader = members.find((m) => m.isLeader) ?? members[0];
    const project = projectId ? projects.find((p) => p.id === projectId) : undefined;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              memberCount: members.length,
              leaderName: leader?.studentName ?? g.leaderName,
              projectTitle: project?.title,
            }
          : g,
      ),
    );
  }, [projects]);

  const getDemoGroupMembers = useCallback((groupId: number) => groupMembers[groupId] ?? [], [groupMembers]);
  const getDemoGroupProjectId = useCallback((groupId: number) => groupProjectIds[groupId], [groupProjectIds]);

  const addProject = useCallback((p: Omit<Project, "id" | "createdAt">) => {
    setProjects((prev) => [
      ...prev,
      { ...p, id: Math.max(0, ...prev.map((x) => x.id)) + 1, createdAt: new Date().toISOString().split("T")[0] },
    ]);
  }, []);

  const updateProject = useCallback((id: number, p: Partial<Project>) => {
    setProjects((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }, []);

  const deleteProject = useCallback((id: number) => {
    setProjects((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addSubmission = useCallback((s: Omit<Submission, "id" | "submittedAt" | "versionNo" | "status">) => {
    setSubmissions((prev) => {
      const versions = prev.filter((x) => x.groupId === s.groupId && x.title === s.title);
      return [
        ...prev,
        {
          ...s,
          id: Math.max(0, ...prev.map((x) => x.id)) + 1,
          versionNo: versions.length + 1,
          submittedAt: new Date().toISOString(),
          status: "Pending",
        },
      ];
    });
  }, []);

  const reviewSubmission = useCallback((id: number, status: string) => {
    setSubmissions((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
  }, []);

  const addMeeting = useCallback((m: Omit<Meeting, "id">) => {
    setMeetings((prev) => [...prev, { ...m, id: Math.max(0, ...prev.map((x) => x.id)) + 1 }]);
  }, []);

  const updateMeeting = useCallback((id: number, m: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((x) => (x.id === id ? { ...x, ...m } : x)));
  }, []);

  const cancelMeeting = useCallback((id: number) => {
    setMeetings((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Cancelled" } : x)));
  }, []);

  const markNotificationRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
  }, []);

  const addDepartment = useCallback((d: Omit<Department, "id" | "createdAt" | "studentCount">) => {
    setDepartments((prev) => [
      ...prev,
      { ...d, id: Math.max(0, ...prev.map((x) => x.id)) + 1, studentCount: 0, createdAt: new Date().toISOString().split("T")[0] },
    ]);
  }, []);

  const updateDepartment = useCallback((id: number, d: Partial<Pick<Department, "name" | "code">>) => {
    setDepartments((prev) => prev.map((dept) => (dept.id === id ? { ...dept, ...d } : dept)));
  }, []);

  const deleteDepartment = useCallback((id: number) => {
    setDepartments((prev) => prev.filter((dept) => dept.id !== id));
  }, []);

  const createGroup = useCallback((groupName: string): Group => {
    const id = Math.max(0, ...groups.map((g) => g.id)) + 1;
    const group: Group = {
      id,
      groupName,
      memberCount: 0,
      leaderName: "—",
      status: "Active",
      createdOn: new Date().toISOString().split("T")[0],
    };
    setGroups((prev) => [...prev, group]);
    setGroupMembers((prev) => ({ ...prev, [id]: [] }));
    return group;
  }, [groups]);

  const updateGroup = useCallback((id: number, groupName: string) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, groupName } : g)));
  }, []);

  const deleteGroup = useCallback((id: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setGroupMembers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setGroupProjectIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const addGroupMember = useCallback((groupId: number, studentId: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    setGroupMembers((prev) => {
      const existing = prev[groupId] ?? [];
      if (existing.some((m) => m.studentId === studentId)) return prev;
      const member: DemoGroupMember = {
        id: Math.max(0, ...Object.values(prev).flat().map((m) => m.id)) + 1,
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        isLeader: existing.length === 0,
      };
      const updated = { ...prev, [groupId]: [...existing, member] };
      syncGroupMeta(groupId, updated[groupId], groupProjectIds[groupId]);
      return updated;
    });
  }, [students, syncGroupMeta, groupProjectIds]);

  const removeGroupMember = useCallback((groupId: number, memberId: number) => {
    setGroupMembers((prev) => {
      const updated = (prev[groupId] ?? []).filter((m) => m.id !== memberId);
      syncGroupMeta(groupId, updated, groupProjectIds[groupId]);
      return { ...prev, [groupId]: updated };
    });
  }, [syncGroupMeta, groupProjectIds]);

  const assignGroupProject = useCallback((groupId: number, projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    setGroupProjectIds((prev) => ({ ...prev, [groupId]: projectId }));
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, projectTitle: project?.title } : g)),
    );
  }, [projects]);

  const getDemoGroupForStudent = useCallback((studentId: number) => {
    for (const group of groups) {
      if ((groupMembers[group.id] ?? []).some((m) => m.studentId === studentId)) {
        return group;
      }
    }
    return undefined;
  }, [groups, groupMembers]);

  const createRubric = useCallback((input: Omit<Evaluation, "id">) => {
    setEvaluations((prev) => [
      ...prev,
      { ...input, id: Math.max(0, ...prev.map((x) => x.id)) + 1 },
    ]);
  }, []);

  const updateRubric = useCallback((id: number, input: Partial<Evaluation>) => {
    setEvaluations((prev) => prev.map((x) => (x.id === id ? { ...x, ...input } : x)));
  }, []);

  const deleteRubric = useCallback((id: number) => {
    setEvaluations((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const createGrade = useCallback((input: Omit<GroupEvaluation, "id" | "evaluationDate">) => {
    setGroupEvaluations((prev) => [
      ...prev,
      {
        ...input,
        id: Math.max(0, ...prev.map((x) => x.id)) + 1,
        evaluationDate: new Date().toISOString().split("T")[0],
      },
    ]);
  }, []);

  const updateGrade = useCallback((id: number, input: Partial<GroupEvaluation>) => {
    setGroupEvaluations((prev) => prev.map((x) => (x.id === id ? { ...x, ...input } : x)));
  }, []);

  const toggleGradePublish = useCallback((id: number) => {
    setGroupEvaluations((prev) =>
      prev.map((x) => (x.id === id ? { ...x, isPublished: !x.isPublished } : x)),
    );
  }, []);

  const value = useMemo(
    () => ({
      projects, students, groups, submissions, evaluations, groupEvaluations,
      meetings, departments, notifications,
      getDemoGroupMembers, getDemoGroupProjectId, getDemoGroupForStudent,
      addProject, updateProject, deleteProject, addSubmission, reviewSubmission,
      addMeeting, updateMeeting, cancelMeeting, markNotificationRead, markAllNotificationsRead, addDepartment, updateDepartment, deleteDepartment,
      createGroup, updateGroup, deleteGroup, addGroupMember, removeGroupMember, assignGroupProject,
      createRubric, updateRubric, deleteRubric, createGrade, updateGrade, toggleGradePublish,
    }),
    [projects, students, groups, submissions, evaluations, groupEvaluations, meetings, departments, notifications,
      getDemoGroupMembers, getDemoGroupProjectId, getDemoGroupForStudent,
      addProject, updateProject, deleteProject, addSubmission, reviewSubmission,
      addMeeting, updateMeeting, cancelMeeting, markNotificationRead, markAllNotificationsRead, addDepartment, updateDepartment, deleteDepartment,
      createGroup, updateGroup, deleteGroup, addGroupMember, removeGroupMember, assignGroupProject,
      createRubric, updateRubric, deleteRubric, createGrade, updateGrade, toggleGradePublish],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

// Demo user profiles kept for session provider reference
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  Student: { id: 1, personId: 1, username: "ahmed.k", email: "ahmed.k@university.edu", role: "Student", firstName: "Ahmed", lastName: "Khan" },
  Advisor: { id: 2, personId: 2, username: "sarah.ahmed", email: "sarah.a@university.edu", role: "Advisor", firstName: "Sarah", lastName: "Ahmed" },
  Admin: { id: 3, personId: 3, username: "admin", email: "admin@university.edu", role: "Admin", firstName: "System", lastName: "Admin" },
  Coordinator: { id: 4, personId: 4, username: "coordinator", email: "coord@university.edu", role: "Coordinator", firstName: "Project", lastName: "Coordinator" },
};
