"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useUnreadCount } from "@/hooks/api/use-unread-count";
import { useTranslation } from "@/providers/locale-provider";
import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: UserProfile;
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ user, onMenuClick, title }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const unread = useUnreadCount();
  const { t, dir } = useTranslation();
  const searchParams = useSearchParams();
  const demoQuery = searchParams.get("demo") === "true"
    ? `?demo=true&role=${searchParams.get("role") ?? user.role}`
    : "";
  const initials = `${user.firstName?.[0] ?? user.username[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <header dir={dir} className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation menu">
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" className="relative" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href={`/notifications${demoQuery}`} aria-label={`${t("nav.notifications")}${unread ? `, ${unread}` : ""}`}>
            <Bell className="size-4" />
            {unread > 0 && (
              <span className={cn(
                "absolute top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground",
                "end-1.5",
              )}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </Button>
        <Link href={`/settings${demoQuery}`} className="ms-1 flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition-colors hover:bg-muted/50">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium">{user.username}</p>
            <p className="truncate text-xs text-muted-foreground">{t(`roles.${user.role}`)}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
