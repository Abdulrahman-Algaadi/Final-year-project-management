"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { AdvisorDashboard } from "@/components/dashboard/advisor-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default function DashboardPage() {
  const { user } = useSession();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <DashboardLayout title={t("nav.dashboard")}>
      {user.role === "Student" && <StudentDashboard />}
      {user.role === "Advisor" && <AdvisorDashboard />}
      {(user.role === "Admin" || user.role === "Coordinator") && <AdminDashboard />}
    </DashboardLayout>
  );
}
