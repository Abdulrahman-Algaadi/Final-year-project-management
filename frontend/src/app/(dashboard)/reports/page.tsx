"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionState } from "@/components/states/permission-state";
import { ErrorState } from "@/components/states/error-state";
import { DashboardSkeleton } from "@/components/states/page-skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useReportsData } from "@/hooks/api/use-reports";
import { GraduationCap, FolderKanban, Users, ClipboardCheck } from "lucide-react";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary-light))",
  "hsl(var(--brand-accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

export default function ReportsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const { data: apiReports, isLoading, isError, error, refetch } = useReportsData();

  if (user?.role !== "Admin" && user?.role !== "Coordinator") {
    return (
      <DashboardLayout title={t("nav.reports")}>
        <PermissionState message={t("reports.permission")} />
      </DashboardLayout>
    );
  }

  const summary = apiReports?.summary;
  const enrollment = apiReports?.enrollment ?? [];
  const submissionSummary = apiReports?.submissionSummary;
  const evaluationSummary = apiReports?.evaluationSummary ?? [];
  const overview = apiReports?.overview;

  const statusData = [
    { name: t("status.Pending"), count: summary?.pending ?? 0 },
    { name: t("status.Ongoing"), count: summary?.ongoing ?? 0 },
    { name: t("status.Completed"), count: summary?.completed ?? 0 },
    { name: t("status.Archived"), count: summary?.archived ?? 0 },
  ];

  const deptData = enrollment.map((d) => ({ name: d.departmentName, students: d.studentCount }));

  const submissionStats = [
    { name: t("status.Approved"), value: submissionSummary?.approved ?? 0 },
    { name: t("status.Pending"), value: submissionSummary?.pending ?? 0 },
    { name: t("status.Rejected"), value: submissionSummary?.rejected ?? 0 },
    { name: t("reports.revision"), value: submissionSummary?.revisionRequired ?? 0 },
  ].filter((s) => s.value > 0);

  const totalStudents = enrollment.reduce((s, d) => s + d.studentCount, 0);
  const activeProjects = summary?.ongoing ?? 0;
  const groupsCount = overview?.totalGroups ?? 0;
  const pendingReviews = submissionSummary?.pending ?? overview?.pendingSubmissions ?? 0;

  const evaluationData = evaluationSummary.map((e) => ({
    name: e.evaluationName,
    avg: e.averageMarks,
    groups: e.groupsEvaluated,
  }));

  return (
    <DashboardLayout title={t("nav.reports")}>
      <div className="space-y-6">
        <PageHeader title={t("reports.title")} description={t("reports.desc")} />

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t("reports.totalStudents")} value={totalStudents} icon={GraduationCap} />
          <StatCard label={t("reports.activeProjects")} value={activeProjects} icon={FolderKanban} />
          <StatCard label={t("reports.groupsLabel")} value={groupsCount} icon={Users} />
          <StatCard label={t("reports.pendingReviews")} value={pendingReviews} icon={ClipboardCheck} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>{t("reports.byStatus")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("reports.outcomes")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={submissionStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {submissionStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader><CardTitle>{t("reports.byDept")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                    <Bar dataKey="students" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {evaluationData.length > 0 && (
            <Card className="xl:col-span-2">
              <CardHeader><CardTitle>{t("reports.evaluationPerformance")}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evaluationData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                      <Bar dataKey="avg" name={t("reports.avgMarks")} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
