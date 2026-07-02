"use client";

import { useMemo, useState } from "react";
import { UserCog, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CardCollection } from "@/components/cards/card-collection";
import { AdvisorCard } from "@/components/cards/advisor-card";
import { PermissionState } from "@/components/states/permission-state";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useAdvisorsPaginated, useDesignationLookups } from "@/hooks/api/use-advisors";
import { useDepartments } from "@/hooks/api/use-departments";
import { useAdvisorMutations } from "@/hooks/api/use-advisor-mutations";
import type { Advisor } from "@/types";

const PAGE_SIZE = 20;

interface AdvisorFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  departmentId: string;
  designationId: string;
  salary: string;
  contactNo: string;
}

const emptyForm = (): AdvisorFormState => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  departmentId: "",
  designationId: "",
  salary: "",
  contactNo: "",
});

export default function AdvisorsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Advisor | null>(null);
  const [form, setForm] = useState<AdvisorFormState>(emptyForm);

  const canAccess = user?.role === "Admin" || user?.role === "Coordinator";
  const { data: departments } = useDepartments({ limit: 100 });
  const { data: designations } = useDesignationLookups();
  const { create, update, remove } = useAdvisorMutations();

  const { data: paginated, isLoading, isError, error, refetch } = useAdvisorsPaginated({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const departmentOptions = useMemo(
    () =>
      (departments ?? []).map((d) => ({
        value: String(d.id),
        label: `${d.code} — ${d.name}`,
        keywords: `${d.code} ${d.name}`,
      })),
    [departments],
  );

  const designationOptions = useMemo(
    () =>
      (designations ?? []).map((d) => ({
        value: String(d.id),
        label: d.value,
        keywords: d.value,
      })),
    [designations],
  );

  if (!canAccess) {
    return (
      <DashboardLayout title={t("nav.advisors")}>
        <PermissionState message={t("advisors.permission")} />
      </DashboardLayout>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (advisor: Advisor) => {
    setEditing(advisor);
    setForm({
      firstName: advisor.firstName,
      lastName: advisor.lastName,
      email: advisor.email,
      password: "",
      departmentId: advisor.departmentId ? String(advisor.departmentId) : "",
      designationId: advisor.designationId ? String(advisor.designationId) : "",
      salary: advisor.salary !== undefined ? String(advisor.salary) : "",
      contactNo: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const departmentId = Number(form.departmentId);
    const designationId = Number(form.designationId);
    const salary = form.salary.trim() ? Number(form.salary) : undefined;

    if (editing) {
      if (!departmentId || !designationId || !form.email.trim()) {
        toast.error(t("advisors.requiredFields"));
        return;
      }
      try {
        await update.mutateAsync({
          id: editing.id,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          email: form.email.trim(),
          departmentId,
          designationId,
          salary,
          contactNo: form.contactNo || undefined,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success(t("advisors.updated"));
        setDialogOpen(false);
        setEditing(null);
        setForm(emptyForm());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update advisor");
      }
      return;
    }

    if (
      !form.email.trim() ||
      !departmentId ||
      !designationId ||
      !form.password ||
      form.password.length < 8
    ) {
      toast.error(t("advisors.requiredFields"));
      return;
    }

    try {
      await create.mutateAsync({
        email: form.email.trim(),
        password: form.password,
        departmentId,
        designationId,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        salary,
        contactNo: form.contactNo || undefined,
      });
      toast.success(t("advisors.created"));
      setDialogOpen(false);
      setForm(emptyForm());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create advisor");
    }
  };

  const handleDelete = async (advisor: Advisor) => {
    const name = `${advisor.firstName} ${advisor.lastName}`.trim() || advisor.email;
    if (!window.confirm(t("advisors.deleteConfirm", { name }))) return;
    try {
      await remove.mutateAsync(advisor.id);
      toast.success(t("advisors.deleted"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete advisor");
    }
  };

  return (
    <DashboardLayout title={t("nav.advisors")}>
      <div className="space-y-6">
        <PageHeader
          title={t("advisors.title")}
          description={t("advisors.desc")}
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              {t("advisors.add")}
            </Button>
          }
        />
        <SearchFilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("advisors.search")}
        />
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <>
            <CardCollection
              items={paginated?.items ?? []}
              keyExtractor={(a) => a.id}
              renderCard={(a) => (
                <AdvisorCard
                  advisor={a}
                  canManage
                  onEdit={() => openEdit(a)}
                  onDelete={() => void handleDelete(a)}
                />
              )}
              emptyIcon={UserCog}
              emptyTitle={t("common.noRecords")}
              emptyDescription={t("advisors.desc")}
              emptyActionLabel={t("advisors.add")}
              onEmptyAction={openCreate}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("advisors.editTitle") : t("advisors.createTitle")}</DialogTitle>
            <DialogDescription>{editing ? t("advisors.editDesc") : t("advisors.createDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t("advisors.firstName")}</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("advisors.lastName")}</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t("advisors.email")} *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5"
                disabled={!!editing}
                placeholder="advisor@university.edu"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t("advisors.department")} *</label>
                <Combobox
                  options={departmentOptions}
                  value={form.departmentId}
                  onValueChange={(value) => setForm({ ...form, departmentId: value })}
                  placeholder={t("advisors.department")}
                  searchPlaceholder={t("departments.search")}
                  emptyMessage={t("common.noRecords")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("advisors.designation")} *</label>
                <Combobox
                  options={designationOptions}
                  value={form.designationId}
                  onValueChange={(value) => setForm({ ...form, designationId: value })}
                  placeholder={t("advisors.designation")}
                  searchPlaceholder={t("advisors.designation")}
                  emptyMessage={t("common.noRecords")}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t("advisors.salary")}</label>
              <Input
                type="number"
                min={0}
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="mt-1.5"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("advisors.contact")}</label>
              <Input
                value={form.contactNo}
                onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {editing ? t("advisors.passwordOptional") : `${t("advisors.password")} *`}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5"
                autoComplete="new-password"
              />
              {!editing && (
                <p className="mt-1 text-xs text-muted-foreground">{t("advisors.passwordHint")}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={() => void handleSave()} loading={create.isPending || update.isPending}>
                {editing ? t("common.save") : t("common.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
