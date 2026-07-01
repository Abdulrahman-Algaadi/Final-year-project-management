"use client";

import Link from "next/link";
import { ArrowRight, Shield, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";
import { AppLogo } from "@/components/shared/app-logo";

export function LandingBrand() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2.5 font-semibold text-white">
      <AppLogo size="sm" />
      <span className="hidden sm:inline">{t("common.appName")}</span>
    </div>
  );
}

export function SignInButton() {
  const { t } = useTranslation();
  return <Link href="/login">{t("common.signIn")}</Link>;
}

export function LandingContent() {
  const { t } = useTranslation();

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="hero-gradient relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute -end-20 -top-20 size-72 rounded-full hero-glow-gold opacity-80" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -start-16 size-96 rounded-full hero-glow-green opacity-70" aria-hidden />

        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("landing.title")}
            <span className="mt-2 block text-brand-accent-light">{t("landing.subtitle")}</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 sm:text-xl">{t("landing.description")}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2 bg-brand-accent text-dark hover:bg-brand-accent-light">
              <Link href="/dashboard?demo=true&role=Student">
                {t("common.getStarted")}
                <ArrowRight className="size-4 rtl-flip" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/login">{t("common.signIn")}</Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: LayoutDashboard, title: t("landing.featureDashboard"), desc: t("landing.featureDashboardDesc") },
            { icon: Users, title: t("landing.featureTeams"), desc: t("landing.featureTeamsDesc") },
            { icon: Shield, title: t("landing.featureSecure"), desc: t("landing.featureSecureDesc") },
          ].map((f) => (
            <div
              key={f.title}
              className="card-lift rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-brand-accent/15">
                <f.icon className="size-5 text-brand-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
