"use client";

import { FolderKanban, FileText, Calendar, Award, Users, Bell } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
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

export function StudentDashboard() {
  const { data: dashboard } = useStudentDashboard();
  const { data: myGroup } = useGroupMe();
  const groupId = dashboard?.groupId ?? myGroup?.id;
  const { data: apiSubmissions } = useSubmissions(undefined, groupId);
  const { data: apiMeetings } = useMeetingsByGroup(groupId);
  const { data: apiGrades } = useGroupEvaluations(groupId);
  const { data: recentNotifications } = useNotificationsPaginated({ page: 1, limit: 4 });
  const { data: unreadList } = useUnreadNotifications();
  const { t } = useTranslation();

  const mySubmissions = apiSubmissions ?? [];

  const nextMeeting = useMemo(() => {
    const upcoming = (apiMeetings ?? [])
      .filter((m) => m.status === "Scheduled" && new Date(m.meetingDate) >= new Date())
      .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());
    return upcoming[0] ?? (dashboard?.nextMeetingDate
      ? { meetingDate: dashboard.nextMeetingDate, groupName: myGroup?.groupName ?? "—" }
      : undefined);
  }, [apiMeetings, dashboard?.nextMeetingDate, myGroup?.groupName]);

  const myGrades = useMemo(
    () => (apiGrades ?? []).filter((g) => g.isPublished),
    [apiGrades],
  );

  const myProject = dashboard?.projectTitle
    ? {
        title: dashboard.projectTitle,
        statusName: dashboard.projectStatus ?? "—",
        department: dashboard.departmentName ?? "—",
      }
    : undefined;

  const notificationList = recentNotifications?.items ?? [];
  const unread = unreadList?.length ?? dashboard?.unreadNotifications ?? 0;
  const avgGrade = myGrades.length
    ? Math.round(myGrades.reduce((s, g) => s + (g.obtainedMarks / g.totalMarks) * 100, 0) / myGrades.length)
    : null;
  const pendingCount = mySubmissions.filter((s) => s.status === "Pending").length;
  const groupLabel = myGroup?.groupName ?? "—";

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
          value={dashboard?.submissionCount ?? mySubmissions.length}
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
                  <Badge variant="secondary">{dashboard?.semesterName ?? "—"}</Badge>
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
                    <p className="mt-1 font-medium">{dashboard?.advisorName ?? "—"}</p>
                    {dashboard?.advisorDesignation && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{dashboard.advisorDesignation}</p>
                    )}
                    {dashboard?.advisorDepartment && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{dashboard.advisorDepartment}</p>
                    )}
                    {dashboard?.advisorEmail && (
                      <p className="mt-1 text-xs text-primary">{dashboard.advisorEmail}</p>
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
                <Link key={n.id} href="/notifications" className={`block rounded-lg border p-3 transition-colors hover:bg-muted/50 ${!n.isRead ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
