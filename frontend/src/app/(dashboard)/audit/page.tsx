"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PermissionState } from "@/components/states/permission-state";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useAuditLogsPaginated } from "@/hooks/api/use-audit";
import { PAGE_SIZE } from "@/lib/api/constants";
import { formatDate } from "@/lib/utils";

export default function AuditPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const canAccess = user?.role === "Admin" || user?.role === "Coordinator";
  const { data: paginated, isLoading, isError, error, refetch } = useAuditLogsPaginated({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  if (!canAccess) {
    return (
      <DashboardLayout title={t("nav.audit")}>
        <PermissionState message={t("audit.permission")} />
      </DashboardLayout>
    );
  }

  const logs = paginated?.items ?? [];

  return (
    <DashboardLayout title={t("nav.audit")}>
      <div className="space-y-6">
        <PageHeader title={t("audit.title")} description={t("audit.desc")} />

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <>
            <SearchFilterBar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder={t("audit.search")}
            />

            {logs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <ScrollText className="size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("common.noRecords")}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-start text-muted-foreground">
                          <th className="px-4 py-3 font-medium">{t("audit.table")}</th>
                          <th className="px-4 py-3 font-medium">{t("audit.record")}</th>
                          <th className="px-4 py-3 font-medium">{t("audit.action")}</th>
                          <th className="px-4 py-3 font-medium">{t("audit.performedBy")}</th>
                          <th className="px-4 py-3 font-medium">{t("audit.date")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3 font-mono text-xs">{log.tableName}</td>
                            <td className="px-4 py-3">#{log.recordId}</td>
                            <td className="px-4 py-3">{log.actionType}</td>
                            <td className="px-4 py-3">{log.performedById ?? "—"}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.actionDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {paginated?.meta && (
              <PaginationControls
                page={paginated.meta.page}
                totalPages={paginated.meta.totalPages}
                total={paginated.meta.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
