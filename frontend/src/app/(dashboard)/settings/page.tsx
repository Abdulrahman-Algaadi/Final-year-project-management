"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, LogOut, User, Pencil, KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { updateProfile, changePassword } from "@/lib/api/services/auth.service";
import type { UserRole } from "@/types";

export default function SettingsPage() {
  const { user, isDemo, demoRole, setDemoRole, signOut, refresh, setUser } = useSession();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
    });
  }, [user]);

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? user.username[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();

  const handleRoleChange = (role: UserRole) => {
    setDemoRole(role);
    const params = new URLSearchParams(searchParams.toString());
    params.set("demo", "true");
    params.set("role", role);
    router.push(`/dashboard?${params.toString()}`);
    toast.success(t("settings.switchedTo", { role: t(`roles.${role}`) }));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    toast.success(t("settings.signedOut"));
  };

  const handleSaveProfile = async () => {
    if (!form.email.trim()) {
      toast.error(t("settings.emailRequired"));
      return;
    }
    if (isDemo) {
      setUser({
        ...user,
        firstName: form.firstName.trim() || user.firstName,
        lastName: form.lastName.trim() || user.lastName,
        email: form.email.trim(),
      });
      setEditing(false);
      toast.success(t("settings.profileUpdated"));
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim(),
      });
      setUser(updated);
      await refresh();
      setEditing(false);
      toast.success(t("settings.profileUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.password.length < 8) {
      toast.error(t("settings.passwordMin"));
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error(t("settings.passwordMismatch"));
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(passwordForm.password);
      setPasswordForm({ password: "", confirm: "" });
      toast.success(t("settings.passwordUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <DashboardLayout title={t("nav.settings")}>
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title={t("settings.title")} description={t("settings.desc")} />

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><User className="size-5" /> {t("settings.profile")}</CardTitle>
              <CardDescription>{t("settings.profileDesc")}</CardDescription>
            </div>
            {!editing && (
              <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" /> {t("common.edit")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary/10 text-lg text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-xs font-medium text-primary">{t(`roles.${user.role}`)}</p>
              </div>
            </div>

            {editing && (
              <div className="space-y-3 border-t pt-4">
                <div>
                  <label className="text-sm font-medium">{t("settings.firstName")}</label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("settings.lastName")}</label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("login.email")}</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>{t("common.cancel")}</Button>
                  <Button type="button" onClick={() => void handleSaveProfile()} loading={saving}>{t("common.save")}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isDemo ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> {t("settings.password")}</CardTitle>
              <CardDescription>{t("settings.passwordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t("settings.newPassword")}</label>
                <Input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="mt-1.5"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("settings.confirmPassword")}</label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="mt-1.5"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => void handleChangePassword()} loading={changingPassword}>
                  {t("settings.updatePassword")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> {t("settings.password")}</CardTitle>
              <CardDescription>{t("settings.passwordDemoDesc")}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("common.language")}</CardTitle>
            <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher variant="full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.appearance")}</CardTitle>
            <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[
              { value: "light", icon: Sun, label: t("settings.light") },
              { value: "dark", icon: Moon, label: t("settings.dark") },
              { value: "system", icon: Monitor, label: t("settings.system") },
            ].map(({ value, icon: Icon, label }) => (
              <Button key={value} variant={theme === value ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setTheme(value)}>
                <Icon className="size-4" /> {label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {isDemo && (
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.demoRole")}</CardTitle>
              <CardDescription>{t("settings.demoRoleDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={demoRole} onChange={(e) => handleRoleChange(e.target.value as UserRole)}>
                <option value="Student">{t("roles.Student")}</option>
                <option value="Advisor">{t("roles.Advisor")}</option>
                <option value="Admin">{t("roles.Admin")}</option>
                <option value="Coordinator">{t("roles.Coordinator")}</option>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>{t("settings.session")}</CardTitle></CardHeader>
          <CardContent>
            <Button variant="destructive" className="gap-2" onClick={handleSignOut}>
              <LogOut className="size-4" /> {t("common.signOut")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
