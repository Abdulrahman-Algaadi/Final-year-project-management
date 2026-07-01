"use client";

import { useMemo, useState } from "react";
import { Award, ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { CardCollection } from "@/components/cards/card-collection";
import { EvaluationGradeCard } from "@/components/cards/evaluation-grade-card";
import { EvaluationRubricCard } from "@/components/cards/evaluation-rubric-card";
import { RecordGradeDialog } from "@/components/evaluations/record-grade-dialog";
import { RubricFormDialog } from "@/components/evaluations/rubric-form-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PAGE_SIZE } from "@/lib/api/constants";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useEvaluationsPaginated, useGroupEvaluations, useGroupEvaluationsPaginated } from "@/hooks/api/use-evaluations";
import { useEvaluationMutations } from "@/hooks/api/use-evaluation-mutations";
import { useGroupMe } from "@/hooks/api/use-group-me";

import { EditGradeDialog } from "@/components/evaluations/edit-grade-dialog";
import type { Evaluation, GroupEvaluation } from "@/types";

export default function EvaluationsPage() {
  const {
    evaluations: mockEvaluations,
    groupEvaluations: mockGrades,
    deleteRubric: deleteDemoRubric,
    toggleGradePublish: toggleDemoPublish,
  } = useAppData();
  const { user, isDemo } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [rubricPage, setRubricPage] = useState(1);
  const [gradePage, setGradePage] = useState(1);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [rubricDialogOpen, setRubricDialogOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<Evaluation | null>(null);
  const [editingGrade, setEditingGrade] = useState<GroupEvaluation | null>(null);
  const isStudent = user?.role === "Student";
  const canManage = user?.role === "Advisor" || user?.role === "Admin" || user?.role === "Coordinator";
  const canCreateRubric = user?.role === "Admin" || user?.role === "Coordinator";

  const { data: myGroup } = useGroupMe();
  const { data: rubricsPaginated, isLoading: rubricsLoading, isError: rubricsError, error: rubricsErr, refetch: refetchRubrics } = useEvaluationsPaginated({
    search: search || undefined,
    page: rubricPage,
    limit: PAGE_SIZE,
  });
  const { data: apiGrades, isLoading: gradesLoading, isError: gradesError, error: gradesErr, refetch: refetchGrades } = useGroupEvaluations(
    isStudent ? myGroup?.id : undefined,
    false,
  );
  const { data: gradesPaginated, isLoading: gradesPaginatedLoading, isError: gradesPaginatedError, error: gradesPaginatedErr, refetch: refetchGradesPaginated } = useGroupEvaluationsPaginated(
    !isStudent ? { search: search || undefined, page: gradePage, limit: PAGE_SIZE } : undefined,
  );
  const { updateGrade, removeRubric } = useEvaluationMutations();

  const evaluations = isDemo ? mockEvaluations : (rubricsPaginated?.items ?? []);
  const rubricTotal = isDemo ? mockEvaluations.length : (rubricsPaginated?.meta.total ?? 0);
  const groupEvaluations = isDemo ? mockGrades : isStudent ? (apiGrades ?? []) : (gradesPaginated?.items ?? []);
  const gradeTotal = isDemo ? mockGrades.length : isStudent ? (apiGrades?.length ?? 0) : (gradesPaginated?.meta.total ?? 0);

  const filteredGrades = useMemo(() => {
    if (!isDemo && !isStudent) return groupEvaluations;
    const q = search.toLowerCase();
    return groupEvaluations
      .filter((g) => !q || g.groupName.toLowerCase().includes(q) || g.evaluationName.toLowerCase().includes(q))
      .filter((g) => (isStudent ? g.isPublished : true));
  }, [groupEvaluations, search, isStudent, isDemo]);

  const gradeSource = isDemo
    ? filteredGrades.filter((g) => {
        if (isStudent) return g.isPublished;
        if (user?.role === "Advisor" && user) {
          const name = `${user.firstName} ${user.lastName}`;
          return g.evaluatorName.includes(name);
        }
        return true;
      })
    : filteredGrades;
  const totalObtained = gradeSource.reduce((s, g) => s + g.obtainedMarks, 0);
  const totalPossible = gradeSource.reduce((s, g) => s + g.totalMarks, 0);
  const percentage = totalPossible ? Math.round((totalObtained / totalPossible) * 100) : 0;

  const loading = !isDemo && (
    rubricsLoading
    || (isStudent ? (gradesLoading || (!myGroup && gradesLoading)) : gradesPaginatedLoading)
  );
  const hasError = !isDemo && (rubricsError || (isStudent ? gradesError : gradesPaginatedError));
  const gradesErrMsg = isStudent ? gradesErr : gradesPaginatedErr;

  const openCreateRubric = () => {
    setEditingRubric(null);
    setRubricDialogOpen(true);
  };

  const openEditRubric = (rubric: Evaluation) => {
    setEditingRubric(rubric);
    setRubricDialogOpen(true);
  };

  const handleDeleteRubric = async (rubric: Evaluation) => {
    if (!window.confirm(t("evaluations.deleteRubricConfirm", { name: rubric.name }))) return;
    try {
      if (isDemo) {
        deleteDemoRubric(rubric.id);
        toast.success(t("evaluations.rubricDeleted"));
        return;
      }
      await removeRubric.mutateAsync(rubric.id);
      toast.success(t("evaluations.rubricDeleted"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    try {
      if (isDemo) {
        toggleDemoPublish(id);
        toast.success(!isPublished ? t("evaluations.published") : t("evaluations.hidden"));
        return;
      }
      await updateGrade.mutateAsync({ id, isPublished: !isPublished });
      toast.success(!isPublished ? t("evaluations.published") : t("evaluations.hidden"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  return (
    <DashboardLayout title={t("nav.evaluations")}>
      <div className="space-y-6">
        <PageHeader
          title={t("evaluations.title")}
          description={t("evaluations.desc")}
          action={canManage && (
            <div className="flex flex-wrap gap-2">
              {canCreateRubric && (
                <Button type="button" variant="outline" onClick={openCreateRubric} className="gap-2">
                  <ClipboardList className="size-4" /> {t("evaluations.createRubric")}
                </Button>
              )}
              {canManage && (
                <Button type="button" onClick={() => setGradeDialogOpen(true)} className="gap-2">
                  <Plus className="size-4" /> {t("evaluations.recordGrade")}
                </Button>
              )}
            </div>
          )}
        />
        <SearchFilterBar
          search={search}
          onSearchChange={(value) => { setSearch(value); setRubricPage(1); setGradePage(1); }}
          placeholder={t("evaluations.search")}
        />

        {isStudent && gradeSource.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("evaluations.gradeSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{percentage}%</span>
                <span className="text-sm text-muted-foreground">
                  {t("evaluations.marksOf", { obtained: String(totalObtained), total: String(totalPossible) })}
                </span>
              </div>
              <Progress value={percentage} />
            </CardContent>
          </Card>
        )}

        {loading ? (
          <TableSkeleton rows={5} />
        ) : hasError ? (
          <ErrorState
            message={(rubricsErr ?? gradesErrMsg) instanceof Error ? (rubricsErr ?? gradesErrMsg)?.message : undefined}
            onRetry={() => { refetchRubrics(); if (isStudent) refetchGrades(); else refetchGradesPaginated(); }}
          />
        ) : (
          <Tabs defaultValue="grades">
            <TabsList>
              <TabsTrigger value="grades">{t("evaluations.grades")} ({gradeTotal})</TabsTrigger>
              {!isStudent && (
                <TabsTrigger value="rubrics">{t("evaluations.rubrics")} ({rubricTotal})</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="grades" className="mt-4 space-y-4">
              <CardCollection
                items={gradeSource}
                keyExtractor={(g) => g.id}
                renderCard={(g) => (
                  <EvaluationGradeCard
                    grade={g}
                    showGroup={!isStudent}
                    showVisibility={!isStudent}
                    canManage={canManage}
                    onEdit={() => setEditingGrade(g)}
                    onTogglePublish={() => void handleTogglePublish(g.id, g.isPublished)}
                  />
                )}
                emptyIcon={Award}
                emptyTitle={isStudent ? t("evaluations.noPublished") : t("evaluations.noEvaluations")}
                emptyDescription={t("evaluations.desc")}
              />
              {!isDemo && !isStudent && gradesPaginated && (
                <PaginationControls
                  page={gradePage}
                  totalPages={gradesPaginated.meta.totalPages}
                  total={gradesPaginated.meta.total}
                  onPageChange={setGradePage}
                />
              )}
            </TabsContent>
            {!isStudent && (
            <TabsContent value="rubrics" className="mt-4 space-y-4">
              <CardCollection
                items={evaluations}
                keyExtractor={(e) => e.id}
                renderCard={(e) => (
                  <EvaluationRubricCard
                    rubric={e}
                    canManage={canCreateRubric}
                    onEdit={() => openEditRubric(e)}
                    onDelete={() => void handleDeleteRubric(e)}
                  />
                )}
                emptyIcon={ClipboardList}
                emptyTitle={t("common.noRecords")}
                emptyDescription={t("evaluations.desc")}
              />
              {!isDemo && rubricsPaginated && (
                <PaginationControls
                  page={rubricPage}
                  totalPages={rubricsPaginated.meta.totalPages}
                  total={rubricsPaginated.meta.total}
                  onPageChange={setRubricPage}
                />
              )}
            </TabsContent>
            )}
          </Tabs>
        )}
      </div>

      <RecordGradeDialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen} />
      <RubricFormDialog
        open={rubricDialogOpen}
        onOpenChange={(open) => { setRubricDialogOpen(open); if (!open) setEditingRubric(null); }}
        rubric={editingRubric}
      />
      <EditGradeDialog
        grade={editingGrade}
        open={!!editingGrade}
        onOpenChange={(open) => { if (!open) setEditingGrade(null); }}
      />
    </DashboardLayout>
  );
}
