import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserCog,
  GraduationCap,
  FileText,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  Building2,
  ClipboardCheck,
  ScrollText,
} from "lucide-react";

export const NAV_ITEMS = [
  { titleKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Advisor", "Student", "Coordinator"] as UserRole[] },
  { titleKey: "nav.projects", href: "/projects", icon: FolderKanban, roles: ["Admin", "Advisor", "Student", "Coordinator"] as UserRole[] },
  { titleKey: "nav.groups", href: "/groups", icon: Users, roles: ["Admin", "Advisor", "Coordinator"] as UserRole[] },
  { titleKey: "nav.students", href: "/students", icon: GraduationCap, roles: ["Admin", "Advisor", "Coordinator"] as UserRole[] },
  { titleKey: "nav.advisors", href: "/advisors", icon: UserCog, roles: ["Admin", "Coordinator"] as UserRole[] },
  { titleKey: "nav.submissions", href: "/submissions", icon: FileText, roles: ["Admin", "Advisor", "Student", "Coordinator"] as UserRole[] },
  { titleKey: "nav.evaluations", href: "/evaluations", icon: ClipboardCheck, roles: ["Admin", "Advisor", "Student", "Coordinator"] as UserRole[] },
  { titleKey: "nav.meetings", href: "/meetings", icon: Calendar, roles: ["Admin", "Advisor", "Student", "Coordinator"] as UserRole[] },
  { titleKey: "nav.departments", href: "/departments", icon: Building2, roles: ["Admin", "Coordinator"] as UserRole[] },
  { titleKey: "nav.reports", href: "/reports", icon: BarChart3, roles: ["Admin", "Coordinator"] as UserRole[] },
  { titleKey: "nav.audit", href: "/audit", icon: ScrollText, roles: ["Admin", "Coordinator"] as UserRole[] },
  { titleKey: "nav.notifications", href: "/notifications", icon: Bell, roles: ["Admin", "Advisor", "Student", "Coordinator"] as UserRole[] },
  { titleKey: "nav.settings", href: "/settings", icon: Settings, roles: ["Admin", "Advisor", "Student", "Coordinator"] as UserRole[] },
] as const;

export function getNavForRole(role: UserRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
