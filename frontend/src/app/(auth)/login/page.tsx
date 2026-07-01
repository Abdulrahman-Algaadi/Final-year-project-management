"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { loginCallback } from "@/lib/api/services/auth.service";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { user, loading: sessionLoading, setUser, refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "missing_env") {
      toast.error("Server misconfigured: add Supabase env vars on Vercel and redeploy.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!sessionLoading && user) {
      router.replace("/dashboard");
    }
  }, [sessionLoading, user, router]);

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = `${t("login.email")} required`;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Invalid email";
    if (!password) next.password = `${t("login.password")} required`;
    else if (password.length < 6) next.password = "Min 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session?.access_token) throw new Error("No session returned");
      const profile = await loginCallback(data.session.access_token);
      setUser(profile);
      await refresh();
      router.refresh();
      toast.success(t("dashboard.welcome"));
      router.replace("/dashboard");
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
            <CardDescription>{t("login.cardDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">{t("login.email")} *</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" autoFocus autoComplete="email" placeholder="you@university.edu" className="ps-9" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">{t("login.password")} *</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" className="ps-9" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" loading={loading}>
                {t("common.signIn")}
                <ArrowRight className="size-4 rtl-flip" />
              </Button>
            </form>
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
