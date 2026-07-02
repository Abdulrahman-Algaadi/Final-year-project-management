"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CardCollection } from "@/components/cards/card-collection";
import { GroupCard } from "@/components/cards/group-card";
import { GroupDetailDialog } from "@/components/groups/group-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useGroupMutations } from "@/hooks/api/use-group-mutations";
import { useGroupsPaginated } from "@/hooks/api/use-groups";
import { PAGE_SIZE } from "@/lib/api/constants";
import type { Group } from "@/types";

export default function GroupsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const canManage = user?.role === "Admin" || user?.role === "Coordinator";
  const { create } = useGroupMutations();

  const { data: paginated, isLoading, isError, error, refetch } = useGroupsPaginated({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const groups = paginated?.items ?? [];

  const openDetail = (group: Group) => {
    setSelectedGroup(group);
    setDetailOpen(true);
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) {
      toast.error(t("groups.nameRequired"));
      return;
    }
    try {
      await create.mutateAsync(newGroupName.trim());
      toast.success(t("groups.created"));
      setCreateOpen(false);
      setNewGroupName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  return (
    <DashboardLayout title={t("nav.groups")}>
      <div className="space-y-6">
        <PageHeader
          title={t("groups.title")}
          description={t("groups.desc")}
          action={canManage && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="size-4" /> {t("groups.create")}
            </Button>
          )}
        />
        <SearchFilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("groups.search")}
        />
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <>
            <CardCollection
              items={groups}
              keyExtractor={(g) => g.id}
              renderCard={(g) => (
                <GroupCard
                  group={g}
                  onManage={() => openDetail(g)}
                  actionLabel={canManage ? t("groups.manage") : t("groups.view")}
                />
              )}
              emptyIcon={Users}
              emptyTitle={t("common.noRecords")}
              emptyDescription={t("groups.desc")}
            />
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

      <GroupDetailDialog
        group={selectedGroup}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canManage={canManage}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("groups.createTitle")}</DialogTitle>
            <DialogDescription>{t("groups.createDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("groups.group")}</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="mt-1.5"
                placeholder={t("groups.namePlaceholder")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={() => void handleCreate()} loading={create.isPending}>{t("common.create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
