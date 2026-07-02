"use client";

import { useMemo, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { CardCollection } from "@/components/cards/card-collection";
import { DepartmentCard } from "@/components/cards/department-card";
import { PermissionState } from "@/components/states/permission-state";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useDepartmentMutations, useDepartments } from "@/hooks/api/use-departments";
import { formatDate } from "@/lib/utils";
import type { Department } from "@/types";

export default function DepartmentsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });

  const { data: departments, isLoading, isError, error, refetch } = useDepartments({
    limit: 100,
  });
  const { create, update, remove } = useDepartmentMutations();

  const canAccess = user?.role === "Admin" || user?.role === "Coordinator";
  const departmentList = departments ?? [];

  const comboboxOptions = useMemo(
    () => [
      { value: "", label: t("departments.all"), keywords: "all" },
      ...departmentList.map((d) => ({
        value: String(d.id),
        label: `${d.code} — ${d.name}`,
        keywords: `${d.code} ${d.name}`,
      })),
    ],
    [departmentList, t],
  );

  const filtered = useMemo(() => {
    if (!selectedId) return departmentList;
    return departmentList.filter((d) => String(d.id) === selectedId);
  }, [departmentList, selectedId]);

  const selectedDepartment: Department | undefined = useMemo(
    () => departmentList.find((d) => String(d.id) === selectedId),
    [departmentList, selectedId],
  );

  if (!canAccess) {
    return (
      <DashboardLayout title={t("nav.departments")}>
        <PermissionState message={t("departments.permission")} />
      </DashboardLayout>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "" });
    setDialogOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditing(department);
    setForm({ name: department.name, code: department.code });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast.error(t("departments.nameCodeRequired"));
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, name: form.name, code: form.code });
        toast.success(t("departments.updated"));
      } else {
        await create.mutateAsync(form);
        toast.success(t("departments.created"));
      }
      setDialogOpen(false);
      setForm({ name: "", code: "" });
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save department");
    }
  };

  const handleDelete = async (department: Department) => {
    if (!window.confirm(t("departments.deleteConfirm", { name: department.name }))) return;
    try {
      await remove.mutateAsync(department.id);
      if (selectedId === String(department.id)) setSelectedId("");
      toast.success(t("departments.deleted"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete department");
    }
  };

  return (
    <DashboardLayout title={t("nav.departments")}>
      <div className="space-y-6">
        <PageHeader
          title={t("departments.title")}
          description={t("departments.desc")}
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" /> {t("departments.add")}
            </Button>
          }
        />

        <div className="max-w-md space-y-2">
          <label className="text-sm font-medium">{t("departments.select")}</label>
          <Combobox
            options={comboboxOptions}
            value={selectedId}
            onValueChange={setSelectedId}
            placeholder={t("departments.selectPlaceholder")}
            searchPlaceholder={t("departments.search")}
            emptyMessage={t("common.noRecords")}
            disabled={isLoading}
          />
        </div>

        {selectedDepartment && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{selectedDepartment.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedDepartment.code}</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">{t("departments.students")}</p>
                <p className="font-medium">{selectedDepartment.studentCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("projects.created")}</p>
                <p className="font-medium">{formatDate(selectedDepartment.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <CardCollection
            items={filtered}
            keyExtractor={(d) => d.id}
            renderCard={(d) => (
              <DepartmentCard
                department={d}
                canManage
                onEdit={() => openEdit(d)}
                onDelete={() => void handleDelete(d)}
              />
            )}
            emptyIcon={Building2}
            emptyTitle={t("common.noRecords")}
            emptyDescription={t("departments.desc")}
            emptyActionLabel={t("departments.add")}
            onEmptyAction={openCreate}
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("departments.editTitle") : t("departments.addTitle")}</DialogTitle>
            <DialogDescription>{editing ? t("departments.editDesc") : t("departments.addDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("departments.name")} *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("departments.code")} *</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CS" className="mt-1.5" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
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
