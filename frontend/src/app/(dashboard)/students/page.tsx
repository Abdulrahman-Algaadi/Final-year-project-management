"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CardCollection } from "@/components/cards/card-collection";
import { StudentCard } from "@/components/cards/student-card";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useStudentsPaginated } from "@/hooks/api/use-students";
import { useSchedulableGroups } from "@/hooks/api/use-schedulable-groups";

const PAGE_SIZE = 20;

export default function StudentsPage() {
  const { students: mockStudents, getDemoGroupMembers } = useAppData();
  const { user, isDemo } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const isAdvisor = user?.role === "Advisor";
  const { groups: schedulableGroups } = useSchedulableGroups();

  const { data: paginated, isLoading, isError, error, refetch } = useStudentsPaginated({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const demoStudentIds = useMemo(() => {
    const ids = new Set<number>();
    schedulableGroups.forEach((g) => {
      getDemoGroupMembers(g.id).forEach((m) => ids.add(m.studentId));
    });
    return ids;
  }, [schedulableGroups, getDemoGroupMembers]);

  const students = useMemo(() => {
    if (!isDemo) return paginated?.items ?? [];
    if (isAdvisor) {
      return mockStudents.filter((s) => demoStudentIds.has(s.id));
    }
    return mockStudents;
  }, [isDemo, isAdvisor, mockStudents, demoStudentIds, paginated?.items]);

  const filtered = useMemo(() => {
    if (!isDemo) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        !q ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.registrationNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }, [students, search, isDemo]);

  return (
    <DashboardLayout title={t("nav.students")}>
      <div className="space-y-6">
        <PageHeader title={t("students.title")} description={t("students.desc")} />
        <SearchFilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("students.search")}
        />
        {!isDemo && isLoading ? (
          <TableSkeleton rows={6} />
        ) : !isDemo && isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
          <>
            <CardCollection
              items={filtered}
              keyExtractor={(s) => s.id}
              renderCard={(s) => <StudentCard student={s} />}
              emptyIcon={GraduationCap}
              emptyTitle={t("common.noRecords")}
              emptyDescription={t("students.desc")}
            />
            {!isDemo && paginated?.meta && (
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
