"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";
import { AppLogo } from "@/components/shared/app-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#home", key: "landing.navHome" },
  { href: "#about", key: "landing.navAbout" },
  { href: "#features", key: "landing.navFeatures" },
  { href: "#team", key: "landing.navTeam" },
  { href: "#contact", key: "landing.navContact" },
] as const;

const STATS = [
  { value: 100, suffix: "+", icon: GraduationCap, color: "bg-[hsl(217,91%,60%)]", labelKey: "landing.statStudents" },
  { value: 50, suffix: "+", icon: BookOpen, color: "bg-[hsl(262,70%,58%)]", labelKey: "landing.statProjects" },
  { value: 20, suffix: "+", icon: Users, color: "bg-[hsl(168,76%,42%)]", labelKey: "landing.statSupervisors" },
  { value: 98, suffix: "%", icon: Trophy, color: "bg-[hsl(38,92%,50%)]", labelKey: "landing.statSuccessRate" },
] as const;

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return count;
}

function StatItem({
  value,
  suffix,
  icon: Icon,
  color,
  label,
  active,
}: {
  value: number;
  suffix: string;
  icon: typeof GraduationCap;
  color: string;
  label: string;
  active: boolean;
}) {
  const count = useCountUp(value, active);

  return (
    <div className="flex flex-col items-center gap-2 px-4 py-2 sm:flex-row sm:gap-4 sm:py-0">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg", color)}>
        <Icon className="size-5 text-white" />
      </div>
      <div className="text-center sm:text-start">
        <p className="text-2xl font-bold text-white sm:text-3xl">
          {count}
          {suffix}
        </p>
        <p className="text-sm text-white/60">{label}</p>
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto h-[320px] w-full max-w-lg sm:h-[380px] lg:h-[420px]">
      <div className="pointer-events-none absolute inset-0 landing-glow-blue opacity-60" aria-hidden />

      {/* Laptop */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute bottom-8 start-1/2 z-10 w-[72%] -translate-x-1/2 [dir=rtl]:translate-x-1/2"
      >
        <div className="rounded-t-xl bg-slate-700 p-1.5 shadow-2xl">
          <div className="overflow-hidden rounded-lg bg-slate-900 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-red-400" />
              <div className="size-2 rounded-full bg-yellow-400" />
              <div className="size-2 rounded-full bg-green-400" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="col-span-2 space-y-1.5">
                <div className="h-8 rounded bg-blue-500/30" />
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-12 rounded bg-blue-400/20" />
                  <div className="h-12 rounded bg-purple-400/20" />
                </div>
                <div className="h-6 rounded bg-white/10" />
              </div>
              <div className="space-y-1.5">
                <div className="h-10 rounded bg-teal-400/25" />
                <div className="h-10 rounded bg-orange-400/25" />
                <div className="h-10 rounded bg-blue-400/20" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-2 w-[110%] rounded-b-lg bg-slate-600" />
        <div className="mx-auto h-1.5 w-[40%] rounded-b-md bg-slate-500" />
      </motion.div>

      {/* Books + cap */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="absolute bottom-16 start-4 sm:start-8"
      >
        <div className="relative">
          <div className="absolute -top-6 start-1/2 -translate-x-1/2">
            <GraduationCap className="size-10 text-[hsl(38,92%,50%)] drop-shadow-lg" />
          </div>
          <div className="space-y-0.5">
            <div className="h-3 w-16 rounded-sm bg-blue-500 shadow-md" />
            <div className="h-3 w-14 rounded-sm bg-purple-500 shadow-md" />
            <div className="h-3 w-16 rounded-sm bg-teal-500 shadow-md" />
          </div>
        </div>
      </motion.div>

      {/* Plant */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-12 end-6 sm:end-10"
      >
        <div className="flex flex-col items-center">
          <div className="size-8 rounded-full bg-teal-400/80" />
          <div className="size-6 rounded-full bg-teal-500/60 -mt-2" />
          <div className="mt-1 h-8 w-5 rounded-b-full bg-orange-700/80" />
        </div>
      </motion.div>

      {/* Floating icons */}
      <div className="landing-float absolute top-8 start-6 flex size-12 items-center justify-center rounded-2xl bg-[hsl(262,70%,58%)]/90 shadow-lg shadow-purple-500/20">
        <ClipboardList className="size-6 text-white" />
      </div>
      <div className="landing-float landing-float-delay-1 absolute top-16 end-4 flex size-12 items-center justify-center rounded-2xl bg-[hsl(168,76%,42%)]/90 shadow-lg shadow-teal-500/20">
        <Users className="size-6 text-white" />
      </div>
      <div className="landing-float landing-float-delay-2 absolute top-2 end-20 flex size-11 items-center justify-center rounded-2xl bg-[hsl(217,91%,60%)]/90 shadow-lg shadow-blue-500/20">
        <BarChart3 className="size-5 text-white" />
      </div>
    </div>
  );
}

function LandingNavbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className="landing-glass sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="#home" className="flex items-center">
          <div className="flex items-center gap-2.5 font-semibold text-white">
            <AppLogo size="sm" />
            <div className="hidden leading-tight sm:block">
              <span className="block text-[10px] uppercase tracking-widest text-white/50">
                {t("landing.universityName")}
              </span>
              <span className="text-sm">{t("common.appName")}</span>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="landing-nav-link text-sm text-white/70">
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            asChild
            className="hidden gap-2 bg-[hsl(217,91%,60%)] text-white hover:bg-[hsl(217,71%,50%)] sm:inline-flex"
          >
            <Link href="/login">
              {t("common.signIn")}
              <LogIn className="size-4" />
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/10 lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </a>
            ))}
            <Button asChild className="mt-2 gap-2 bg-[hsl(217,91%,60%)] text-white hover:bg-[hsl(217,71%,50%)]">
              <Link href="/login" onClick={() => setOpen(false)}>
                {t("common.signIn")}
                <LogIn className="size-4" />
              </Link>
            </Button>
          </div>
        </motion.nav>
      )}
    </header>
  );
}

function StatsBar() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative z-20 mx-auto -mt-8 max-w-5xl px-4 sm:-mt-12 sm:px-6"
    >
      <div className="landing-glass-strong grid grid-cols-2 gap-6 rounded-2xl p-6 shadow-2xl sm:grid-cols-4 sm:gap-4 sm:p-8">
        {STATS.map((stat) => (
          <StatItem
            key={stat.labelKey}
            value={stat.value}
            suffix={stat.suffix}
            icon={stat.icon}
            color={stat.color}
            label={t(stat.labelKey)}
            active={inView}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ScrollIndicator() {
  const { t } = useTranslation();

  return (
    <a
      href="#about"
      className="landing-scroll-bounce mt-10 flex flex-col items-center gap-2 text-white/50 transition-colors hover:text-white/80"
    >
      <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-current pt-1.5">
        <div className="size-1 rounded-full bg-current" />
      </div>
      <span className="text-xs tracking-wide">{t("landing.scrollDown")}</span>
      <ChevronDown className="size-4 opacity-60" />
    </a>
  );
}

export function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { icon: LayoutDashboard, title: t("landing.featureDashboard"), desc: t("landing.featureDashboardDesc"), color: "bg-blue-500/15 text-blue-400" },
    { icon: Users, title: t("landing.featureTeams"), desc: t("landing.featureTeamsDesc"), color: "bg-purple-500/15 text-purple-400" },
    { icon: Shield, title: t("landing.featureSecure"), desc: t("landing.featureSecureDesc"), color: "bg-teal-500/15 text-teal-400" },
    { icon: FileText, title: t("landing.featureSubmissions"), desc: t("landing.featureSubmissionsDesc"), color: "bg-orange-500/15 text-orange-400" },
    { icon: Calendar, title: t("landing.featureMeetings"), desc: t("landing.featureMeetingsDesc"), color: "bg-pink-500/15 text-pink-400" },
    { icon: BarChart3, title: t("landing.featureReports"), desc: t("landing.featureReportsDesc"), color: "bg-indigo-500/15 text-indigo-400" },
  ];

  const team = [
    { initials: "AA", role: t("landing.teamRole1"), color: "from-blue-500 to-blue-700" },
    { initials: "BK", role: t("landing.teamRole2"), color: "from-purple-500 to-purple-700" },
    { initials: "CM", role: t("landing.teamRole3"), color: "from-teal-500 to-teal-700" },
    { initials: "DS", role: t("landing.teamRole4"), color: "from-orange-500 to-orange-700" },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
  };

  return (
    <div className="landing-page flex min-h-dvh flex-col">
      <LandingNavbar />

      {/* Hero */}
      <section id="home" className="landing-hero-bg relative overflow-hidden pb-20 pt-12 sm:pb-28 sm:pt-16">
        <div className="pointer-events-none absolute -end-32 -top-32 size-96 rounded-full landing-glow-blue opacity-50" aria-hidden />
        <div className="pointer-events-none absolute -bottom-48 -start-32 size-80 rounded-full landing-glow-purple opacity-40" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(217,91%,60%)]"
            >
              {t("landing.welcomeTo")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
            >
              {t("landing.title")}
              <span className="mt-1 block text-[hsl(217,91%,65%)]">{t("landing.subtitle")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-base text-white/70 sm:text-lg"
            >
              {t("landing.description")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="gap-2 bg-[hsl(217,91%,60%)] text-white shadow-lg shadow-blue-500/25 hover:bg-[hsl(217,71%,50%)]"
              >
                <Link href="/login">
                  {t("common.getStarted")}
                  <ArrowRight className="size-4 rtl-flip" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#about">
                  {t("landing.learnMore")}
                  <ChevronDown className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <HeroIllustration />
        </div>

        <StatsBar />

        <div className="flex justify-center">
          <ScrollIndicator />
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("landing.aboutTitle")}</h2>
            <p className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg">{t("landing.aboutDescription")}</p>
            <ul className="mt-8 space-y-3">
              {[t("landing.aboutPoint1"), t("landing.aboutPoint2"), t("landing.aboutPoint3")].map((point) => (
                <li key={point} className="flex items-start gap-3 text-white/75">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[hsl(217,91%,60%)]" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="landing-glass-strong overflow-hidden rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Projects", val: "50+", color: "bg-blue-500/20" },
                  { label: "Groups", val: "30+", color: "bg-purple-500/20" },
                  { label: "Reviews", val: "200+", color: "bg-teal-500/20" },
                  { label: "Meetings", val: "150+", color: "bg-orange-500/20" },
                ].map((item) => (
                  <div key={item.label} className={cn("rounded-xl p-4", item.color)}>
                    <p className="text-2xl font-bold text-white">{item.val}</p>
                    <p className="text-sm text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-blue-500 to-teal-400" />
              </div>
              <p className="mt-2 text-xs text-white/50">Platform activity overview</p>
            </div>
            <div className="absolute -bottom-4 -end-4 -z-10 size-32 rounded-full landing-glow-blue opacity-60" aria-hidden />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("landing.featuresTitle")}</h2>
            <p className="mt-4 text-white/60">{t("landing.featuresSubtitle")}</p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i}
                className="landing-glass group rounded-2xl p-6 transition-all hover:border-white/20 hover:bg-white/[0.08]"
              >
                <div className={cn("mb-4 flex size-12 items-center justify-center rounded-xl", f.color)}>
                  <f.icon className="size-6" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("landing.teamTitle")}</h2>
            <p className="mt-4 text-white/60">{t("landing.teamSubtitle")}</p>
          </motion.div>

          <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {team.map((member, i) => (
              <motion.div
                key={member.role}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex size-20 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white shadow-lg sm:size-24",
                    member.color,
                  )}
                >
                  {member.initials}
                </div>
                <p className="mt-4 text-sm font-medium text-white">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="mt-auto border-t border-white/10 bg-[hsl(222,47%,5%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <AppLogo size="sm" />
                <span className="font-semibold text-white">{t("common.appName")}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/55">{t("landing.footerDesc")}</p>
            </div>

            <div>
              <h3 className="font-semibold text-white">{t("landing.footerQuickLinks")}</h3>
              <ul className="mt-4 space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-white/55 transition-colors hover:text-white">
                      {t(link.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white">{t("landing.footerContact")}</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-2 text-sm text-white/55">
                  <MapPin className="size-4 shrink-0 text-[hsl(217,91%,60%)]" />
                  {t("landing.footerAddress")}
                </li>
                <li className="flex items-center gap-2 text-sm text-white/55">
                  <Mail className="size-4 shrink-0 text-[hsl(217,91%,60%)]" />
                  {t("landing.footerEmail")}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} {t("landing.universityName")}. {t("landing.footerRights")}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}
