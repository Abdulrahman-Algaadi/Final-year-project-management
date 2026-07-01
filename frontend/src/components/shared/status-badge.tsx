"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/locale-provider";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  Pending: "warning",
  Approved: "success",
  Ongoing: "default",
  Completed: "success",
  Rejected: "destructive",
  RevisionRequired: "warning",
  Active: "success",
  Inactive: "secondary",
  Graduated: "secondary",
  Scheduled: "default",
  Cancelled: "destructive",
  Archived: "secondary",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const key = `status.${status}`;
  const label = t(key);
  const translated = label === key ? status : label;
  return <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>{translated}</Badge>;
}
