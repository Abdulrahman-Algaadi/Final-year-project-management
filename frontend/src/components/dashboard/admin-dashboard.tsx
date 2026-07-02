"use client";

import { GraduationCap, FolderKanban, Users, Building2, ClipboardCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useAdminDashboard } from "@/hooks/api/use-dashboard";
import { useProjectsByDepartment } from "@/hooks/api/use-reports";
import { useMemo } from "react";

export function AdminDashboard() {
  const { user } = useSession();
  const { data: dashboard } = useAdminDashboard();
  const { data: projectsByDept } = useProjectsByDepartment();
  const { t } = useTranslation();
  const isCoordinator = user?.role === "Coordinator";

  const totalStudents = dashboard?.totalStudents ?? 0;
  const totalProjects = dashboard?.totalProjects ?? 0;
  const totalGroups = dashboard?.totalGroups ?? 0;
  const totalDepartments = dashboard?.totalDepartments ?? 0;
  const pendingReviews = dashboard?.pendingSubmissions ?? 0;

  const chartData = useMemo(() => {
    return (projectsByDept ?? []).map((d) => ({
      name: d.departmentName.split(" ")[0] ?? d.departmentName,
      count: d.projectCount,
    }));
  }, [projectsByDept]);

  const activities = [
    t("dashboard.activitySubmissions", { count: String(pendingReviews) }),
    t("dashboard.activityProjects", { count: String(dashboard?.pendingProjects ?? 0) }),
    t("dashboard.activityGroups", { count: String(totalGroups) }),
    t("dashboard.activityStudents", { count: String(totalStudents) }),
    t("dashboard.activityDepartments", { count: String(totalDepartments) }),
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isCoordinator ? t("dashboard.coordinatorTitle") : t("dashboard.adminTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isCoordinator ? t("dashboard.coordinatorDesc") : t("dashboard.adminDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label={t("dashboard.totalStudents")} value={totalStudents} icon={GraduationCap} trend="up" change={`${totalStudents} ${t("dashboard.active")}`} />
        <StatCard label={t("dashboard.projectsLabel")} value={totalProjects} icon={FolderKanban} />
        <StatCard label={t("dashboard.groupsLabel")} value={totalGroups} icon={Users} />
        <StatCard label={t("dashboard.departments")} value={totalDepartments} icon={Building2} />
        <StatCard label={t("dashboard.pendingReviews")} value={pendingReviews} icon={ClipboardCheck} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>{t("dashboard.projectsByDept")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("dashboard.systemActivity")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activities.map((a) => (
              <div key={a} className="rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50">{a}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
