"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { AdvisorDashboard } from "@/components/dashboard/advisor-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { Select } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserRole } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, isDemo, demoRole, setDemoRole } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRoleChange = (role: UserRole) => {
    setDemoRole(role);
    const params = new URLSearchParams(searchParams.toString());
    params.set("demo", "true");
    params.set("role", role);
    router.replace(`/dashboard?${params.toString()}`);
    toast.success(t("settings.switchedTo", { role: t(`roles.${role}`) }));
  };

  if (!user) return null;

  return (
    <DashboardLayout title={t("nav.dashboard")}>
      {isDemo && (
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t("dashboard.demoMode")}</span> — {t("dashboard.demoHint")}
          </p>
          <Select value={demoRole} onChange={(e) => handleRoleChange(e.target.value as UserRole)} className="w-full sm:w-44">
            <option value="Student">{t("roles.Student")}</option>
            <option value="Advisor">{t("roles.Advisor")}</option>
            <option value="Admin">{t("roles.Admin")}</option>
            <option value="Coordinator">{t("roles.Coordinator")}</option>
          </Select>
        </div>
      )}

      {user.role === "Student" && <StudentDashboard />}
      {user.role === "Advisor" && <AdvisorDashboard />}
      {(user.role === "Admin" || user.role === "Coordinator") && <AdminDashboard />}
    </DashboardLayout>
  );
}
