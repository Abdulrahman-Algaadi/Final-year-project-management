"use client";

import { FolderKanban, FileText, Calendar, Award, Users, Bell } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useAppData, DEMO_USERS } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useStudentDashboard } from "@/hooks/api/use-dashboard";
import { useGroupEvaluations } from "@/hooks/api/use-evaluations";
import { useGroupMe } from "@/hooks/api/use-group-me";
import { useMeetingsByGroup } from "@/hooks/api/use-meetings";
import { useNotificationsPaginated, useUnreadNotifications } from "@/hooks/api/use-notifications";
import { useSubmissions } from "@/hooks/api/use-submissions";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export function StudentDashboard() {
  const { projects, submissions, meetings, notifications, groupEvaluations, getDemoGroupProjectId } = useAppData();
  const { isDemo } = useSession();
  const { data: dashboard } = useStudentDashboard();
  const { data: myGroup } = useGroupMe();
  const groupId = dashboard?.groupId ?? myGroup?.id;
  const { data: apiSubmissions } = useSubmissions(undefined, groupId);
  const { data: apiMeetings } = useMeetingsByGroup(groupId);
  const { data: apiGrades } = useGroupEvaluations(groupId);
  const { data: recentNotifications } = useNotificationsPaginated({ page: 1, limit: 4 });
  const { data: unreadList } = useUnreadNotifications();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const demoQuery = searchParams.get("demo") === "true" ? `?demo=true&role=Student` : "";

  const liveSubmissions = apiSubmissions ?? [];

  const liveMeetings = useMemo(() => {
    return (apiMeetings ?? [])
      .filter((m) => m.status === "Scheduled" && new Date(m.meetingDate) >= new Date())
      .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());
  }, [apiMeetings]);

  const liveGrades = useMemo(
    () => (apiGrades ?? []).filter((g) => g.isPublished),
    [apiGrades],
  );

  const demoProjectId = myGroup ? getDemoGroupProjectId(myGroup.id) : undefined;
  const myProject = isDemo
    ? projects.find((p) => p.id === demoProjectId)
    : dashboard?.projectTitle
      ? {
          title: dashboard.projectTitle,
          statusName: dashboard.projectStatus ?? "—",
          department: dashboard.departmentName ?? "—",
        }
      : undefined;

  const demoAdvisorInfo = useMemo(() => {
    if (!isDemo || !myGroup?.id) return undefined;
    const groupMeetings = meetings
      .filter((m) => m.groupId === myGroup.id)
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
    const advisorName = groupMeetings[0]?.advisorName;
    if (!advisorName) return undefined;
    const profile = DEMO_USERS.Advisor;
    const matchesDemoAdvisor = advisorName
      .toLowerCase()
      .includes((profile.lastName ?? "").toLowerCase());
    const project = projects.find((p) => p.id === demoProjectId);
    return {
      label: advisorName,
      email: matchesDemoAdvisor ? profile.email : undefined,
      dept: project?.department,
      role: matchesDemoAdvisor ? "Senior Lecturer" : undefined,
    };
  }, [isDemo, myGroup?.id, meetings, projects, demoProjectId]);
  const groupLabel = myGroup?.groupName ?? "—";
  const mySubmissions = isDemo
    ? submissions.filter((s) => s.groupId === myGroup?.id)
    : liveSubmissions;
  const nextMeeting = isDemo
    ? meetings
        .filter((m) => m.groupId === myGroup?.id && m.status === "Scheduled")
        .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime())[0]
    : liveMeetings[0] ?? (dashboard?.nextMeetingDate
      ? { meetingDate: dashboard.nextMeetingDate, groupName: groupLabel }
      : undefined);
  const notificationList = isDemo ? notifications : (recentNotifications?.items ?? []);
  const unread = isDemo
    ? notifications.filter((n) => !n.isRead).length
    : (unreadList?.length ?? dashboard?.unreadNotifications ?? 0);
  const myGrades = isDemo
    ? groupEvaluations.filter((g) => g.groupId === myGroup?.id && g.isPublished)
    : liveGrades;
  const avgGrade = myGrades.length
    ? Math.round(myGrades.reduce((s, g) => s + (g.obtainedMarks / g.totalMarks) * 100, 0) / myGrades.length)
    : null;
  const pendingCount = mySubmissions.filter((s) => s.status === "Pending").length;
  const advisorLabel = isDemo
    ? (demoAdvisorInfo?.label ?? "—")
    : (dashboard?.advisorName ?? "—");
  const advisorEmail = isDemo ? demoAdvisorInfo?.email : dashboard?.advisorEmail;
  const advisorDept = isDemo ? demoAdvisorInfo?.dept : dashboard?.advisorDepartment;
  const advisorRole = isDemo ? demoAdvisorInfo?.role : dashboard?.advisorDesignation;
  const semesterLabel = isDemo
    ? (projects.find((p) => p.id === demoProjectId)?.semesterName ?? "—")
    : (dashboard?.semesterName ?? "—");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("dashboard.welcome")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.studentDesc")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("dashboard.projectStatus")} value={myProject?.statusName ?? "—"} icon={FolderKanban} />
        <StatCard
          label={t("dashboard.submissions")}
          value={isDemo ? mySubmissions.length : (dashboard?.submissionCount ?? mySubmissions.length)}
          icon={FileText}
          change={pendingCount > 0 ? `${pendingCount} ${t("dashboard.pending")}` : undefined}
        />
        <StatCard
          label={t("dashboard.nextMeeting")}
          value={nextMeeting ? formatDateTime(nextMeeting.meetingDate).split(",")[0] : "—"}
          icon={Calendar}
        />
        <StatCard
          label={t("dashboard.avgGrade")}
          value={avgGrade !== null ? `${avgGrade}%` : "—"}
          icon={Award}
          change={avgGrade === null ? t("dashboard.notPublished") : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.projectOverview")}</CardTitle>
            <CardDescription>{myProject?.title ?? t("dashboard.noProject")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myProject && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge>{myProject.department}</Badge>
                  <Badge variant="secondary">{semesterLabel}</Badge>
                  <Badge variant="success">{myProject.statusName}</Badge>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("dashboard.overallProgress")}</span>
                    <span className="font-medium">{avgGrade !== null ? `${avgGrade}%` : "—"}</span>
                  </div>
                  <Progress value={avgGrade ?? 0} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">{t("dashboard.supervisor")}</p>
                    <p className="mt-1 font-medium">{advisorLabel}</p>
                    {advisorRole && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{advisorRole}</p>
                    )}
                    {advisorDept && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{advisorDept}</p>
                    )}
                    {advisorEmail && (
                      <p className="mt-1 text-xs text-primary">{advisorEmail}</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">{t("dashboard.group")}</p>
                    <p className="mt-1 flex items-center gap-1.5 font-medium">
                      <Users className="size-4 text-muted-foreground" /> {groupLabel}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Bell className="size-4" /> {t("nav.notifications")}</span>
              {unread > 0 && <Badge variant="destructive">{unread}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificationList.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("notifications.caughtUp")}</p>
            ) : (
              notificationList.slice(0, 4).map((n) => (
              <Link key={n.id} href={`/notifications${demoQuery}`} className={`block rounded-lg border p-3 transition-colors hover:bg-muted/50 ${!n.isRead ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </Link>
            )))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
