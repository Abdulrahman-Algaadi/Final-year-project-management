"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-sm text-muted-foreground">
        {t("common.pageOf", { page: String(page), totalPages: String(totalPages) })}
        {total !== undefined ? ` · ${t("common.totalCount", { count: String(total) })}` : null}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4 rtl-flip" />
          {t("common.previous")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("common.next")}
          <ChevronRight className="size-4 rtl-flip" />
        </Button>
      </div>
    </div>
  );
}
