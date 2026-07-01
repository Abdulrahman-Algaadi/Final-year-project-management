"use client";

import { Users, FolderKanban, ClipboardCheck, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useAdvisorDashboard } from "@/hooks/api/use-dashboard";
import { useMeetings } from "@/hooks/api/use-meetings";
import { useSchedulableGroups } from "@/hooks/api/use-schedulable-groups";
import { useSubmissions } from "@/hooks/api/use-submissions";
import { formatDateTime } from "@/lib/utils";

export function AdvisorDashboard() {
  const { submissions, meetings, groupEvaluations } = useAppData();
  const { isDemo, user } = useSession();
  const { data: dashboard } = useAdvisorDashboard();
  const { data: apiSubmissions } = useSubmissions({ limit: 20, sortOrder: "DESC" });
  const { data: apiMeetings } = useMeetings({ limit: 20, sortOrder: "ASC" });
  const { groups: schedulableGroups } = useSchedulableGroups();
  const { t } = useTranslation();

  const demoGroupIds = useMemo(
    () => new Set(schedulableGroups.map((g) => g.id)),
    [schedulableGroups],
  );

  const demoSubmissions = useMemo(
    () => submissions.filter((s) => demoGroupIds.has(s.groupId)),
    [submissions, demoGroupIds],
  );

  const demoMeetings = useMemo(() => {
    if (!isDemo || !user) return meetings;
    const name = `${user.firstName} ${user.lastName}`;
    return meetings.filter((m) => m.advisorName.includes(name));
  }, [isDemo, meetings, user]);

  const demoGrades = useMemo(
    () => groupEvaluations.filter((g) => demoGroupIds.has(g.groupId)),
    [groupEvaluations, demoGroupIds],
  );

  const pendingSubmissions = isDemo
    ? demoSubmissions.filter((s) => s.status === "Pending")
    : (apiSubmissions ?? []).filter((s) => s.status === "Pending");

  const upcomingMeetings = useMemo(() => {
    if (isDemo) {
      return demoMeetings.filter((m) => m.status === "Scheduled");
    }
    return (apiMeetings ?? [])
      .filter((m) => m.status === "Scheduled" && new Date(m.meetingDate) >= new Date())
      .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());
  }, [isDemo, demoMeetings, apiMeetings]);

  const recentSubmissions = isDemo ? demoSubmissions : (apiSubmissions ?? []);
  const pendingEvalsCount = isDemo
    ? demoGrades.filter((g) => !g.isPublished).length
    : (dashboard?.evaluationsPending ?? 0);

  const assignedGroups = isDemo ? schedulableGroups.length : (dashboard?.assignedProjects ?? 0);
  const activeProjects = isDemo
    ? schedulableGroups.filter((g) => g.projectTitle).length
    : (dashboard?.assignedProjects ?? 0);
  const pendingCount = isDemo ? pendingSubmissions.length : (dashboard?.pendingSubmissions ?? pendingSubmissions.length);
  const upcomingCount = isDemo ? upcomingMeetings.length : (dashboard?.upcomingMeetings ?? upcomingMeetings.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("dashboard.advisorTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.advisorDesc")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("dashboard.assignedGroups")} value={assignedGroups} icon={Users} />
        <StatCard label={t("dashboard.activeProjects")} value={activeProjects} icon={FolderKanban} />
        <StatCard label={t("dashboard.pendingReviews")} value={pendingCount} icon={ClipboardCheck} change={t("dashboard.needsAction")} />
        <StatCard label={t("dashboard.upcomingMeetings")} value={upcomingCount} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("dashboard.recentSubmissions")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.noRecords")}</p>
            ) : recentSubmissions.slice(0, 4).map((s) => (
              <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.groupName} · v{s.versionNo}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("dashboard.upcomingMeetings")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcomingMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.noUpcomingMeetings")}</p>
            ) : upcomingMeetings.slice(0, 4).map((m) => (
              <div key={m.id} className="rounded-lg border border-border p-4">
                <p className="font-medium">{m.groupName}</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(m.meetingDate)}</p>
                <p className="text-xs text-muted-foreground">{m.location ?? m.onlineLink ?? "—"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {pendingEvalsCount > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 text-sm">
            {pendingEvalsCount === 1
              ? t("dashboard.evalsAwaitingCount", { count: String(pendingEvalsCount) })
              : t("dashboard.evalsAwaitingCountPlural", { count: String(pendingEvalsCount) })}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
