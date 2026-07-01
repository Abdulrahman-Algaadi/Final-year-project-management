"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { motion, AnimatePresence } from "framer-motion";
import { getNavForRole } from "@/config/navigation";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";
import { useUnreadCount } from "@/hooks/api/use-unread-count";

interface SidebarProps {
  role: UserRole;
  open?: boolean;
  onClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({ role, open = true, onClose, mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, dir } = useTranslation();
  const unreadCount = useUnreadCount();
  const items = getNavForRole(role);
  const demoQuery = searchParams.get("demo") === "true"
    ? `?demo=true&role=${searchParams.get("role") ?? role}`
    : "";
  const slideFrom = dir === "rtl" ? "100%" : "-100%";

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href={`/dashboard${demoQuery}`} className="flex min-w-0 items-center gap-2.5 font-semibold">
          <AppLogo size="sm" />
          <span className="truncate text-sm sm:text-base">{t("common.appName")}</span>
        </Link>
        {mobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="size-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {items.map((item) => {
          const href = `${item.href}${demoQuery}`;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              onClick={mobile ? onClose : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-muted",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{t(item.titleKey)}</span>
              {item.href === "/notifications" && unreadCount > 0 && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  if (mobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onClose}
              aria-hidden
            />
            <motion.aside
              dir={dir}
              initial={{ x: slideFrom }}
              animate={{ x: 0 }}
              exit={{ x: slideFrom }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 start-0 z-50 w-[min(100vw-3rem,280px)] border-e border-sidebar-border bg-sidebar shadow-xl lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside
      dir={dir}
      className={cn(
        "fixed inset-y-0 start-0 z-30 hidden h-screen w-64 shrink-0 border-e border-sidebar-border bg-sidebar lg:block xl:w-72",
      )}
    >
      {content}
    </aside>
  );
}
