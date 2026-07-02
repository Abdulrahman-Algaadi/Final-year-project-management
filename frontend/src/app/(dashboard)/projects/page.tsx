"use client";

import { useMemo, useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { CardCollection } from "@/components/cards/card-collection";
import { ProjectCard } from "@/components/cards/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useDepartments } from "@/hooks/api/use-departments";
import { useProjectsPaginated } from "@/hooks/api/use-projects";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PAGE_SIZE } from "@/lib/api/constants";
import { useProjectMutations } from "@/hooks/api/use-project-mutations";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { PROJECT_STATUSES } from "@/lib/data/constants";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: "", description: "", statusName: "Pending", departmentId: "" });
  const [page, setPage] = useState(1);

  const { data: paginated, isLoading, isError, error, refetch } = useProjectsPaginated({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const { data: apiDepartments } = useDepartments({ limit: 100 });
  const { create, update, remove } = useProjectMutations();

  const projects = paginated?.items ?? [];
  const departments = apiDepartments ?? [];
  const canManage = user?.role === "Admin" || user?.role === "Coordinator";

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        value: String(d.id),
        label: `${d.code} — ${d.name}`,
        keywords: `${d.code} ${d.name}`,
      })),
    [departments],
  );

  const departmentFilterOptions = useMemo(
    () => [
      { value: "all", label: t("departments.all"), keywords: "all" },
      ...departmentOptions,
    ],
    [departmentOptions, t],
  );

  const getDepartmentName = (departmentId: string) =>
    departments.find((d) => String(d.id) === departmentId)?.name ?? "";

  const findDepartmentId = (name?: string) => {
    if (!name) return "";
    const match = departments.find((d) => d.name === name);
    return match ? String(match.id) : "";
  };

  const filtered = useMemo(() => {
    const filterDepartmentName =
      departmentFilter === "all" ? undefined : getDepartmentName(departmentFilter);

    return projects.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.department?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.statusName === statusFilter;
      const matchDepartment =
        !filterDepartmentName || p.department?.toLowerCase() === filterDepartmentName.toLowerCase();
      return matchSearch && matchStatus && matchDepartment;
    });
  }, [projects, search, statusFilter, departmentFilter, departments]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", statusName: "Pending", departmentId: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      statusName: p.statusName,
      departmentId: findDepartmentId(p.department),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error(t("projects.titleRequired"));
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          title: form.title,
          description: form.description,
          statusName: form.statusName,
        });
        toast.success(t("projects.updatedToast"));
      } else {
        await create.mutateAsync({
          title: form.title,
          description: form.description,
          statusName: form.statusName,
        });
        toast.success(t("projects.createdToast"));
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("projects.deleteConfirm"))) return;
    try {
      await remove.mutateAsync(id);
      toast.success(t("projects.deletedToast"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  return (
    <DashboardLayout title={t("nav.projects")}>
      <div className="space-y-6">
        <PageHeader
          title={t("projects.title")}
          description={t("projects.desc")}
          action={canManage && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" /> {t("projects.new")}
            </Button>
          )}
        />

        {isLoading ? (
          <TableSkeleton rows={6} />
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
          placeholder={t("common.search")}
          filters={
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Combobox
                options={departmentFilterOptions}
                value={departmentFilter === "all" ? "all" : departmentFilter}
                onValueChange={(value) => setDepartmentFilter(value || "all")}
                placeholder={t("projects.department")}
                searchPlaceholder={t("departments.search")}
                emptyMessage={t("common.noRecords")}
                className="w-full sm:w-56"
              />
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40">
                <option value="all">{t("common.allStatuses")}</option>
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
              </Select>
            </div>
          }
        />

        <CardCollection
          items={filtered}
          keyExtractor={(p) => p.id}
          renderCard={(p) => (
            <ProjectCard
              project={p}
              canManage={canManage}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p.id)}
            />
          )}
          emptyIcon={FolderKanban}
          emptyTitle={t("common.noRecords")}
          emptyDescription={t("projects.desc")}
          emptyActionLabel={canManage ? t("projects.new") : undefined}
          onEmptyAction={canManage ? openCreate : undefined}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("projects.editTitle") : t("projects.createTitle")}</DialogTitle>
            <DialogDescription>{t("projects.formDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("projects.projectTitle")} *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("projects.description")}</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t("projects.department")}</label>
                <Combobox
                  options={departmentOptions}
                  value={form.departmentId}
                  onValueChange={(value) => setForm({ ...form, departmentId: value })}
                  placeholder={t("departments.selectPlaceholder")}
                  searchPlaceholder={t("departments.search")}
                  emptyMessage={t("common.noRecords")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("projects.status")}</label>
                <Select value={form.statusName} onChange={(e) => setForm({ ...form, statusName: e.target.value })} className="mt-1.5">
                  {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave}>{editing ? t("common.save") : t("common.create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
