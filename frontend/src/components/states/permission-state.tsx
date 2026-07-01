"use client";

import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/providers/locale-provider";

interface PermissionStateProps {
  title?: string;
  message?: string;
}

export function PermissionState({ title, message }: PermissionStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center sm:py-16" role="status">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
        <ShieldOff className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title ?? t("states.accessRestricted")}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message ?? t("states.permissionDefault")}</p>
      <Button asChild className="mt-6" variant="outline">
        <Link href="/dashboard">{t("common.backToDashboard")}</Link>
      </Button>
    </div>
  );
}
