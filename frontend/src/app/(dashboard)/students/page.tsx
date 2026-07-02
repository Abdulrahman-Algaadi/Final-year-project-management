"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CardCollection } from "@/components/cards/card-collection";
import { StudentCard } from "@/components/cards/student-card";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useStudentsPaginated } from "@/hooks/api/use-students";
import { useDepartments } from "@/hooks/api/use-departments";
import { useReferenceData } from "@/hooks/api/use-reference-data";
import { useStudentMutations } from "@/hooks/api/use-student-mutations";
import type { Student } from "@/types";

const PAGE_SIZE = 20;

interface StudentFormState {
  firstName: string;
  lastName: string;
  registrationNo: string;
  password: string;
  departmentId: string;
  semesterId: string;
  enrollmentYear: string;
}

const emptyForm = (): StudentFormState => ({
  firstName: "",
  lastName: "",
  registrationNo: "",
  password: "",
  departmentId: "",
  semesterId: "",
  enrollmentYear: String(new Date().getFullYear()),
});

export default function StudentsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentFormState>(emptyForm);

  const canManage = user?.role === "Admin" || user?.role === "Coordinator";
  const { data: departments } = useDepartments({ limit: 100 });
  const { data: reference } = useReferenceData();
  const { create, update } = useStudentMutations();

  const { data: paginated, isLoading, isError, error, refetch } = useStudentsPaginated({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const students = paginated?.items ?? [];

  const departmentOptions = useMemo(
    () =>
      (departments ?? []).map((d) => ({
        value: String(d.id),
        label: `${d.code} — ${d.name}`,
        keywords: `${d.code} ${d.name}`,
      })),
    [departments],
  );

  const semesterOptions = useMemo(() => {
    if (!reference?.semesters) return [];
    return Array.from(reference.semesters.entries()).map(([id, name]) => ({
      value: String(id),
      label: name,
      keywords: name,
    }));
  }, [reference?.semesters]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      registrationNo: student.registrationNo,
      password: "",
      departmentId: student.departmentId ? String(student.departmentId) : "",
      semesterId: student.semesterId ? String(student.semesterId) : "",
      enrollmentYear: String(student.enrollmentYear),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const departmentId = Number(form.departmentId);
    const semesterId = Number(form.semesterId);
    const enrollmentYear = Number(form.enrollmentYear);

    if (editing) {
      if (!departmentId || !semesterId || !enrollmentYear) {
        toast.error(t("students.requiredFields"));
        return;
      }
      try {
        await update.mutateAsync({
          id: editing.id,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          departmentId,
          semesterId,
          enrollmentYear,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success(t("students.updated"));
        setDialogOpen(false);
        setEditing(null);
        setForm(emptyForm());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update student");
      }
      return;
    }

    if (
      !form.registrationNo.trim() ||
      !departmentId ||
      !semesterId ||
      !enrollmentYear ||
      !form.password ||
      form.password.length < 8
    ) {
      toast.error(t("students.requiredFields"));
      return;
    }

    try {
      await create.mutateAsync({
        registrationNo: form.registrationNo.trim(),
        departmentId,
        semesterId,
        enrollmentYear,
        password: form.password,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
      });
      toast.success(t("students.created"));
      setDialogOpen(false);
      setForm(emptyForm());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create student");
    }
  };

  return (
    <DashboardLayout title={t("nav.students")}>
      <div className="space-y-6">
        <PageHeader
          title={t("students.title")}
          description={t("students.desc")}
          action={
            canManage ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="size-4" />
                {t("students.add")}
              </Button>
            ) : undefined
          }
        />
        <SearchFilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("students.search")}
        />
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <>
            <CardCollection
              items={students}
              keyExtractor={(s) => s.id}
              renderCard={(s) => (
                <StudentCard
                  student={s}
                  canManage={canManage}
                  onEdit={() => openEdit(s)}
                />
              )}
              emptyIcon={GraduationCap}
              emptyTitle={t("common.noRecords")}
              emptyDescription={t("students.desc")}
              emptyActionLabel={canManage ? t("students.add") : undefined}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("students.editTitle") : t("students.createTitle")}</DialogTitle>
            <DialogDescription>{editing ? t("students.editDesc") : t("students.createDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t("students.firstName")}</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("students.lastName")}</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("students.registration")} {editing ? "" : "*"}
              </label>
              <Input
                value={form.registrationNo}
                onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                className="mt-1.5"
                disabled={!!editing}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t("students.department")} *</label>
                <Combobox
                  options={departmentOptions}
                  value={form.departmentId}
                  onValueChange={(value) => setForm({ ...form, departmentId: value })}
                  placeholder={t("students.department")}
                  searchPlaceholder={t("departments.search")}
                  emptyMessage={t("common.noRecords")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("students.semester")} *</label>
                <Combobox
                  options={semesterOptions}
                  value={form.semesterId}
                  onValueChange={(value) => setForm({ ...form, semesterId: value })}
                  placeholder={t("students.semester")}
                  searchPlaceholder={t("students.semester")}
                  emptyMessage={t("common.noRecords")}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t("students.year")} *</label>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={form.enrollmentYear}
                onChange={(e) => setForm({ ...form, enrollmentYear: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {editing ? t("students.passwordOptional") : `${t("students.password")} *`}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5"
                autoComplete="new-password"
              />
              {!editing && (
                <p className="mt-1 text-xs text-muted-foreground">{t("students.passwordHint")}</p>
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
