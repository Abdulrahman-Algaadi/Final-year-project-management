"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Hash } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { hasSupabaseConfig, getMissingPublicEnvVars } from "@/lib/env";
import { setCachedAccessToken } from "@/lib/api/auth-token";
import { createClientAsync } from "@/lib/supabase/client";
import { loginCallback, loginStudent } from "@/lib/api/services/auth.service";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { toast } from "sonner";

type LoginMode = "staff" | "student";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { user, loading: sessionLoading, setUser } = useSession();
  const [mode, setMode] = useState<LoginMode>("staff");
  const [email, setEmail] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    registrationNo?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const supabaseConfigured = hasSupabaseConfig();
  const missingEnvVars = getMissingPublicEnvVars();

  useEffect(() => {
    if (searchParams.get("error") === "missing_env") {
      toast.error("Server misconfigured: add Supabase env vars on Vercel and redeploy.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!sessionLoading && user) {
      window.location.assign("/dashboard");
    }
  }, [sessionLoading, user]);

  const validate = () => {
    const next: typeof errors = {};
    if (mode === "staff") {
      if (!email) next.email = `${t("login.email")} required`;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Invalid email";
    } else {
      if (!registrationNo.trim()) next.registrationNo = `${t("login.registrationNo")} required`;
    }
    if (!password) next.password = `${t("login.password")} required`;
    else if (mode === "student" && password.length < 8) next.password = "Min 8 characters";
    else if (mode === "staff" && password.length < 6) next.password = "Min 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const supabase = await createClientAsync();
      if (!supabase) throw new Error("Supabase is not configured on this deployment.");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session?.access_token) throw new Error("No session returned");
      setCachedAccessToken(data.session.access_token);
      const profile = await loginCallback(data.session.access_token);
      setUser(profile);
      toast.success(t("dashboard.welcome"));
      window.location.assign("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const profile = await loginStudent(registrationNo.trim(), password);
      setUser(profile);
      toast.success(t("dashboard.welcome"));
      window.location.assign("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4 py-8">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppLogo size="md" className="mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">{t("common.appName")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("login.cardTitle")}</CardTitle>
            <CardDescription>
              {mode === "student" ? t("login.studentHint") : t("login.cardDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!supabaseConfigured && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive"
              >
                <p className="font-medium">Deployment not configured</p>
                <p className="mt-1 text-destructive/90">
                  Add these in Vercel → Settings → Environment Variables (enable{" "}
                  <strong>Production</strong> and <strong>Preview</strong>), then redeploy:
                </p>
                <ul className="mt-2 list-inside list-disc font-mono text-xs">
                  {missingEnvVars.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            )}

            <Tabs
              value={mode}
              onValueChange={(value) => {
                setMode(value as LoginMode);
                setErrors({});
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="staff">{t("login.staffTab")}</TabsTrigger>
                <TabsTrigger value="student">{t("login.studentTab")}</TabsTrigger>
              </TabsList>

              <TabsContent value="staff">
                <form onSubmit={handleStaffSubmit} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      {t("login.email")} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoFocus
                        autoComplete="email"
                        placeholder="you@university.edu"
                        className="ps-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="staff-password" className="text-sm font-medium">
                      {t("login.password")} *
                    </label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="staff-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="ps-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" loading={loading} disabled={!supabaseConfigured}>
                    {t("common.signIn")}
                    <ArrowRight className="size-4 rtl-flip" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="student">
                <form onSubmit={handleStudentSubmit} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <label htmlFor="registrationNo" className="text-sm font-medium">
                      {t("login.registrationNo")} *
                    </label>
                    <div className="relative">
                      <Hash className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="registrationNo"
                        type="text"
                        autoComplete="username"
                        placeholder="FYP-2025-001"
                        className="ps-9"
                        value={registrationNo}
                        onChange={(e) => setRegistrationNo(e.target.value)}
                        error={errors.registrationNo}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="student-password" className="text-sm font-medium">
                      {t("login.password")} *
                    </label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="student-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="ps-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" loading={loading} disabled={!supabaseConfigured}>
                    {t("common.signIn")}
                    <ArrowRight className="size-4 rtl-flip" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("login.demoPrefix")}{" "}
          <Link href="/dashboard?demo=true" className="font-medium text-primary hover:underline">
            {t("login.demoLink")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
