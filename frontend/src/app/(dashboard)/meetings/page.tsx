"use client";

import { useMemo, useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader, SearchFilterBar } from "@/components/shared/page-header";
import { CardCollection } from "@/components/cards/card-collection";
import { MeetingCard } from "@/components/cards/meeting-card";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import { useMeetingMutations, useMeetingsByGroup, useMeetingsPaginated } from "@/hooks/api/use-meetings";
import { useGroupMe } from "@/hooks/api/use-group-me";
import { useSchedulableGroups } from "@/hooks/api/use-schedulable-groups";
import { PAGE_SIZE } from "@/lib/api/constants";
import { ErrorState } from "@/components/states/error-state";
import { TableSkeleton } from "@/components/states/page-skeleton";
import { EditMeetingDialog } from "@/components/meetings/edit-meeting-dialog";
import type { Meeting } from "@/types";

export default function MeetingsPage() {
  const { user } = useSession();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Meeting | null>(null);
  const [form, setForm] = useState({
    groupId: "",
    meetingDate: "", location: "", onlineLink: "", notes: "",
  });

  const isStudent = user?.role === "Student";
  const { data: myGroup } = useGroupMe();
  const { groups } = useSchedulableGroups();

  const { data: paginated, isLoading: listLoading, isError, error, refetch } = useMeetingsPaginated(
    { search: search || undefined, page, limit: PAGE_SIZE },
    !isStudent,
  );
  const { data: groupMeetings, isLoading: groupLoading } = useMeetingsByGroup(
    isStudent ? myGroup?.id : undefined,
  );
  const { create, remove } = useMeetingMutations();

  const isLoading = isStudent ? groupLoading : listLoading;
  const meetings = isStudent ? (groupMeetings ?? []) : (paginated?.items ?? []);
  const canCreate = user?.role === "Advisor" || user?.role === "Admin" || user?.role === "Coordinator";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return meetings.filter((m) => !q || m.groupName.toLowerCase().includes(q) || m.advisorName.toLowerCase().includes(q));
  }, [meetings, search]);

  const upcoming = filtered.filter((m) => m.status === "Scheduled");
  const past = filtered.filter((m) => m.status !== "Scheduled");

  const handleCreate = async () => {
    if (!form.meetingDate) {
      toast.error(t("meetings.dateRequired"));
      return;
    }
    if (!form.groupId) {
      toast.error(t("groups.selectGroup"));
      return;
    }
    if (new Date(form.meetingDate) < new Date()) {
      toast.error(t("meetings.pastDateError"));
      return;
    }
    try {
      await create.mutateAsync({
        groupId: Number(form.groupId),
        advisorId: user!.personId,
        meetingDate: new Date(form.meetingDate).toISOString(),
        location: form.location || undefined,
        onlineLink: form.onlineLink || undefined,
        notes: form.notes || undefined,
      });
      toast.success(t("meetings.scheduled"));
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule meeting");
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await remove.mutateAsync(id);
      toast.success(t("meetings.cancelled"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel meeting");
    }
  };

  return (
    <DashboardLayout title={t("nav.meetings")}>
      <div className="space-y-6">
        <PageHeader
          title={t("meetings.title")}
          description={t("meetings.desc")}
          action={canCreate && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="size-4" /> {t("meetings.schedule")}
            </Button>
          )}
        />
        <SearchFilterBar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          placeholder={t("meetings.search")}
        />

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : !isStudent && isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">{t("meetings.upcoming")} ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">{t("meetings.past")} ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4">
            <CardCollection
              items={upcoming}
              keyExtractor={(m) => m.id}
              columns="wide"
              renderCard={(m) => (
                <MeetingCard
                  meeting={m}
                  withLabel={t("meetings.with")}
                  canCancel={canCreate}
                  canEdit={canCreate}
                  onEdit={() => setEditTarget(m)}
                  onCancel={() => void handleCancel(m.id)}
                />
              )}
              emptyIcon={Calendar}
              emptyTitle={t("meetings.noUpcoming")}
              emptyDescription={t("meetings.desc")}
              emptyActionLabel={canCreate ? t("meetings.schedule") : undefined}
              onEmptyAction={canCreate ? () => setDialogOpen(true) : undefined}
            />
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            <CardCollection
              items={past}
              keyExtractor={(m) => m.id}
              columns="wide"
              renderCard={(m) => (
                <MeetingCard meeting={m} withLabel={t("meetings.with")} />
              )}
              emptyIcon={Calendar}
              emptyTitle={t("meetings.noPast")}
              emptyDescription={t("meetings.desc")}
            />
          </TabsContent>
        </Tabs>
        )}

        {!isStudent && paginated && (
          <PaginationControls
            page={page}
            totalPages={paginated.meta.totalPages}
            total={paginated.meta.total}
            onPageChange={setPage}
          />
        )}

      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("meetings.scheduleTitle")}</DialogTitle>
            <DialogDescription>{t("meetings.scheduleDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("groups.group")}</label>
              <Select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="mt-1.5">
                <option value="">{t("groups.selectGroup")}</option>
                {(groups ?? []).map((g) => (
                  <option key={g.id} value={g.id}>{g.groupName}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("meetings.datetime")} *</label>
              <Input type="datetime-local" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("meetings.location")}</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Room 201, CS Building" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("meetings.onlineLink")}</label>
              <Input value={form.onlineLink} onChange={(e) => setForm({ ...form, onlineLink: e.target.value })} placeholder="https://meet.google.com/..." className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("meetings.notes")}</label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreate} loading={create.isPending}>{t("common.schedule")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditMeetingDialog
        meeting={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
      />
    </DashboardLayout>
  );
}
