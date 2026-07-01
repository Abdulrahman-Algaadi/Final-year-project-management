"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useTranslation } from "@/providers/locale-provider";
import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: UserProfile;
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ user, children, title }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { dir } = useTranslation();

  return (
    <>
      <div dir={dir} className="min-h-dvh w-full bg-background">
        <Sidebar role={user.role} />
        <div
          className={cn(
            "flex min-h-dvh min-w-0 flex-col transition-[margin] duration-200",
            "lg:ms-64 xl:ms-72",
          )}
        >
          <Header user={user} title={title} onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <Sidebar role={user.role} mobile open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
