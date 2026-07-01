"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardSkeleton } from "@/components/states/page-skeleton";
import { useSession } from "@/providers/session-provider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  requireAuth?: boolean;
}

export function DashboardLayout({ children, title, requireAuth = true }: DashboardLayoutProps) {
  const { user, loading, isDemo } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && requireAuth && !isDemo) {
      router.replace("/login");
    }
  }, [user, loading, requireAuth, isDemo, router]);

  if (loading) return <DashboardSkeleton />;
  if (!user) return <DashboardSkeleton />;

  return <AppShell user={user} title={title}>{children}</AppShell>;
}
