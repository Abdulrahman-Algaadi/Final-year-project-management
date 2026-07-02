"use client";

import { useMemo, useState } from "react";
import { Plus, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CardCollection } from "@/components/cards/card-collection";
import { SubmissionCard } from "@/components/cards/submission-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useGroupMe } from "@/hooks/api/use-group-me";
import { useCreateSubmission, useReviewSubmission, useSubmissions, useSubmissionsPaginated } from "@/hooks/api/use-submissions";
import { PAGE_SIZE } from "@/lib/api/constants";
import { getSubmissionDownloadUrl } from "@/lib/api/services/submissions.service";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { ReviewSubmissionDialog, type ReviewStatus } from "@/components/submissions/review-submission-dialog";
import { SUBMISSION_TYPES } from "@/lib/data/constants";
import type { Submission } from "@/types";

export default function SubmissionsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Submission | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", submissionType: "ProgressReport" });

  const isStudent = user?.role === "Student";
  const canReview = user?.role === "Advisor" || user?.role === "Admin" || user?.role === "Coordinator";

  const { data: myGroup } = useGroupMe();

  const { data: paginated, isLoading: listLoading, isError, error, refetch } = useSubmissionsPaginated(
    { search: search || undefined, page, limit: PAGE_SIZE },
    !isStudent,
  );
  const { data: groupSubmissions, isLoading: groupLoading } = useSubmissions(
    isStudent ? { search: search || undefined, limit: 100 } : undefined,
    isStudent ? myGroup?.id : undefined,
  );
  const createMutation = useCreateSubmission();
  const reviewMutation = useReviewSubmission();

  const isLoading = isStudent ? groupLoading : listLoading;
  const submissions = isStudent ? (groupSubmissions ?? []) : (paginated?.items ?? []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return submissions.filter(
      (s) => !q || s.title.toLowerCase().includes(q) || s.groupName.toLowerCase().includes(q),
    );
  }, [submissions, search]);

  const revisionRequired = useMemo(
    () => filtered.some((s) => s.status === "RevisionRequired"),
    [filtered],
  );

  const pagedSubmissions = useMemo(() => {
    if (!isStudent) return filtered;
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, isStudent, page]);

  const displaySubmissions = isStudent ? pagedSubmissions : filtered;
  const studentTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleDownload = async (id: number) => {
    try {
      const url = await getSubmissionDownloadUrl(id);
      window.open(url, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleUpload = async () => {
    if (!form.title.trim()) {
      toast.error(t("submissions.titleRequired"));
      return;
    }

    try {
      if (!myGroup?.id) {
        toast.error("No group assigned");
        return;
      }
      if (!selectedFile) {
        toast.error(t("submissions.titleRequired"));
        return;
      }
      setUploading(true);
      await createMutation.mutateAsync({
        groupId: myGroup.id,
        title: form.title.trim(),
        submissionType: form.submissionType,
        file: selectedFile,
      });
      toast.success(t("submissions.uploadSuccess"));
      setDialogOpen(false);
      setSelectedFile(null);
      setForm({ title: "", submissionType: "ProgressReport" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleReview = async (id: number, status: string) => {
    try {
      await reviewMutation.mutateAsync({ id, status });
      const message =
        status === "Approved"
          ? t("submissions.approved")
          : status === "RevisionRequired"
            ? t("submissions.revisionRequested")
            : t("submissions.rejected");
      toast.success(message);
      setReviewTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Review failed");
    }
  };

  const handleReviewFromDialog = (status: ReviewStatus) => {
    if (!reviewTarget) return;
    void handleReview(reviewTarget.id, status);
  };

  const canUpload = isStudent && !!myGroup?.id;

  return (
    <DashboardLayout title={t("nav.submissions")}>
      <div className="space-y-6">
        <PageHeader
          title={t("submissions.title")}
          description={t("submissions.desc")}
          action={canUpload && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Upload className="size-4" /> {t("submissions.upload")}
            </Button>
          )}
        />
        <SearchFilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("submissions.search")}
        />
        {isStudent && revisionRequired && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 text-sm">{t("submissions.revisionBanner")}</CardContent>
          </Card>
        )}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
        <>
        <CardCollection
          items={displaySubmissions}
          keyExtractor={(s) => s.id}
          renderCard={(s) => (
            <SubmissionCard
              submission={s}
              showGroup={!isStudent}
              showRevisionHint={isStudent}
              canReview={canReview && s.status === "Pending"}
              onDownload={() => void handleDownload(s.id)}
              onReview={canReview && s.status === "Pending" ? () => setReviewTarget(s) : undefined}
            />
          )}
          emptyIcon={FileText}
          emptyTitle={t("common.noRecords")}
          emptyDescription={t("submissions.desc")}
          emptyActionLabel={canUpload ? t("submissions.upload") : undefined}
          onEmptyAction={canUpload ? () => setDialogOpen(true) : undefined}
        />
        {isStudent && filtered.length > PAGE_SIZE && (
          <PaginationControls
            page={page}
            totalPages={studentTotalPages}
            total={filtered.length}
            onPageChange={setPage}
          />
        )}
        {!isStudent && paginated?.meta && (
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
            <DialogTitle>{t("submissions.uploadTitle")}</DialogTitle>
            <DialogDescription>{t("submissions.uploadDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("submissions.titleLabel")} *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("submissions.type")}</label>
              <Select value={form.submissionType} onChange={(e) => setForm({ ...form, submissionType: e.target.value })} className="mt-1.5">
                {SUBMISSION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </div>
            {myGroup && (
              <div>
                <label className="text-sm font-medium">{t("groups.group")}</label>
                <Input value={myGroup.groupName} disabled className="mt-1.5" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">{t("submissions.file")} *</label>
              <Input
                type="file"
                className="mt-1.5"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedFile(file);
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleUpload} loading={uploading || createMutation.isPending} className="gap-2">
                <Plus className="size-4" /> {t("common.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReviewSubmissionDialog
        submission={reviewTarget}
        open={!!reviewTarget}
        onOpenChange={(open) => { if (!open) setReviewTarget(null); }}
        onReview={handleReviewFromDialog}
        loading={reviewMutation.isPending}
      />
    </DashboardLayout>
  );
}
