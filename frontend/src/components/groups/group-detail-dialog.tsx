"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, UserPlus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { AsyncSearchCombobox } from "@/components/ui/async-search-combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGroupMutations } from "@/hooks/api/use-group-mutations";
import { fetchGroupById } from "@/lib/api/services/groups.service";
import { fetchProjectsPaginated } from "@/lib/api/services/projects.service";
import { fetchStudentsPaginated } from "@/lib/api/services/students.service";
import { fetchAdvisorsPaginated } from "@/lib/api/services/advisors.service";
import { fetchLookupsByCategory } from "@/lib/api/services/lookups.service";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import { formatPersonName } from "@/lib/api/mappers/student.mapper";
import { useTranslation } from "@/providers/locale-provider";
import type { Group } from "@/types";
import type { GroupDto } from "@/types/api";

const PICKER_PAGE_SIZE = 25;

interface GroupDetailDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage?: boolean;
}

export function GroupDetailDialog({ group, open, onOpenChange, canManage }: GroupDetailDialogProps) {
  const { t } = useTranslation();

  const [detail, setDetail] = useState<GroupDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectLabel, setProjectLabel] = useState("");
  const [groupName, setGroupName] = useState("");
  const [names, setNames] = useState<Record<number, string>>({});
  const [advisorId, setAdvisorId] = useState("");
  const [advisorRoleId, setAdvisorRoleId] = useState("");
  const [advisorNames, setAdvisorNames] = useState<Record<number, string>>({});
  const [advisorRoleLabels, setAdvisorRoleLabels] = useState<Record<number, string>>({});
  const [advisorRoleOptions, setAdvisorRoleOptions] = useState<{ value: string; label: string }[]>([]);

  const { addMember, removeMember, assignProject, assignAdvisor, removeAdvisor, update, remove } = useGroupMutations();

  useEffect(() => {
    if (group) setGroupName(group.groupName);
  }, [group]);

  useEffect(() => {
    if (!open || !group) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchGroupById(group.id)
      .then((dto) => {
        if (cancelled) return;
        setDetail(dto);
        const pid = dto.project?.projectId;
        setProjectId(pid ? String(pid) : "");
        setProjectLabel(group.projectTitle ?? "");
      })
      .catch(() => toast.error(t("states.loadError")))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, group, t, group?.projectTitle]);

  useEffect(() => {
    if (!detail) return;
    const hasAdvisorData = (detail.advisors?.length ?? 0) > 0 || (detail.members?.length ?? 0) > 0;
    if (!hasAdvisorData) return;
    let cancelled = false;
    fetchReferenceData().then((ref) => {
      if (cancelled) return;
      if (detail.members?.length) {
        const map: Record<number, string> = {};
        detail.members.forEach((m) => {
          map[m.studentId] = formatPersonName(ref, m.studentId);
        });
        setNames(map);
      }
      const pid = detail.project?.projectId;
      if (pid) {
        setProjectLabel(ref.projects.get(pid)?.title ?? group?.projectTitle ?? "");
      }
      const advisorMap: Record<number, string> = {};
      detail.advisors?.forEach((a) => {
        const person = ref.advisors.get(a.advisorId);
        advisorMap[a.advisorId] = person ? `${person.firstName} ${person.lastName}` : `#${a.advisorId}`;
      });
      setAdvisorNames(advisorMap);
    });
    return () => { cancelled = true; };
  }, [detail, group?.projectTitle]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchLookupsByCategory("AdvisorRole").then((roles) => {
      if (cancelled) return;
      setAdvisorRoleOptions(roles.map((r) => ({ value: String(r.id), label: r.value })));
      const labels: Record<number, string> = {};
      roles.forEach((r) => { labels[r.id] = r.value; });
      setAdvisorRoleLabels(labels);
      if (canManage) {
        const supervisor = roles.find((r) => r.value === "Supervisor");
        if (supervisor) {
          setAdvisorRoleId((current) => current || String(supervisor.id));
        }
      }
    });
    return () => { cancelled = true; };
  }, [open, canManage]);

  const memberRows = useMemo(() => detail?.members ?? [], [detail]);
  const advisorRows = useMemo(() => detail?.advisors ?? [], [detail]);
  const memberStudentIds = useMemo(
    () => new Set(memberRows.map((m) => m.studentId)),
    [memberRows],
  );
  const assignedAdvisorIds = useMemo(
    () => new Set(advisorRows.map((a) => a.advisorId)),
    [advisorRows],
  );
  const hasProject = Boolean(detail?.project?.projectId);

  const searchStudents = useCallback(
    async (query: string, page: number) => {
      const result = await fetchStudentsPaginated({
        search: query || undefined,
        page,
        limit: PICKER_PAGE_SIZE,
      });
      const options = result.items
        .filter((s) => !memberStudentIds.has(s.id))
        .map((s) => ({
          value: String(s.id),
          label: `${s.firstName} ${s.lastName} (${s.registrationNo})`,
          keywords: `${s.email} ${s.registrationNo}`,
        }));
      const currentPage = result.meta?.page ?? page;
      const totalPages = result.meta?.totalPages ?? 1;
      return { options, hasMore: currentPage < totalPages };
    },
    [memberStudentIds],
  );

  const searchProjects = useCallback(async (query: string, page: number) => {
    const result = await fetchProjectsPaginated({
      search: query || undefined,
      page,
      limit: PICKER_PAGE_SIZE,
    });
    const options = result.items.map((p) => ({
      value: String(p.id),
      label: p.title,
      keywords: p.description ?? "",
    }));
    const currentPage = result.meta?.page ?? page;
    const totalPages = result.meta?.totalPages ?? 1;
    return { options, hasMore: currentPage < totalPages };
  }, []);

  const searchAdvisors = useCallback(
    async (query: string, page: number) => {
      const result = await fetchAdvisorsPaginated({
        search: query || undefined,
        page,
        limit: PICKER_PAGE_SIZE,
      });
      const options = result.items
        .filter((a) => !assignedAdvisorIds.has(a.id))
        .map((a) => ({
          value: String(a.id),
          label: `${a.firstName} ${a.lastName}`,
          keywords: `${a.email} ${a.department}`,
        }));
      const currentPage = result.meta?.page ?? page;
      const totalPages = result.meta?.totalPages ?? 1;
      return { options, hasMore: currentPage < totalPages };
    },
    [assignedAdvisorIds],
  );

  const handleAddMember = async () => {
    if (!group || !studentId) return;
    try {
      const dto = await addMember.mutateAsync({
        groupId: group.id,
        studentId: Number(studentId),
      });
      setDetail(dto);
      setStudentId("");
      toast.success(t("groups.memberAdded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!group) return;
    try {
      const dto = await removeMember.mutateAsync({ groupId: group.id, memberId });
      setDetail(dto);
      toast.success(t("groups.memberRemoved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleAssignProject = async () => {
    if (!group || !projectId) return;
    try {
      const dto = await assignProject.mutateAsync({
        groupId: group.id,
        projectId: Number(projectId),
      });
      setDetail(dto);
      const ref = await fetchReferenceData();
      setProjectLabel(ref.projects.get(Number(projectId))?.title ?? projectLabel);
      toast.success(t("groups.projectAssigned"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleAssignAdvisor = async () => {
    if (!group || !advisorId || !hasProject) return;
    try {
      const dto = await assignAdvisor.mutateAsync({
        groupId: group.id,
        advisorId: Number(advisorId),
        advisorRoleId: advisorRoleId ? Number(advisorRoleId) : undefined,
      });
      setDetail(dto);
      setAdvisorId("");
      const ref = await fetchReferenceData();
      const advisorMap: Record<number, string> = { ...advisorNames };
      dto.advisors?.forEach((a) => {
        const person = ref.advisors.get(a.advisorId);
        advisorMap[a.advisorId] = person ? `${person.firstName} ${person.lastName}` : `#${a.advisorId}`;
      });
      setAdvisorNames(advisorMap);
      toast.success(t("groups.advisorAssigned"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleRemoveAdvisor = async (assignmentId: number) => {
    if (!group) return;
    try {
      const dto = await removeAdvisor.mutateAsync({ groupId: group.id, assignmentId });
      setDetail(dto);
      const ref = await fetchReferenceData();
      const advisorMap: Record<number, string> = {};
      dto.advisors?.forEach((a) => {
        const person = ref.advisors.get(a.advisorId);
        advisorMap[a.advisorId] = person ? `${person.firstName} ${person.lastName}` : `#${a.advisorId}`;
      });
      setAdvisorNames(advisorMap);
      toast.success(t("groups.advisorRemoved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleRename = async () => {
    if (!group || !groupName.trim()) return;
    try {
      await update.mutateAsync({ id: group.id, groupName: groupName.trim() });
      toast.success(t("groups.renamed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleDelete = async () => {
    if (!group) return;
    if (!window.confirm(t("groups.deleteConfirm", { name: group.groupName }))) return;
    try {
      await remove.mutateAsync(group.id);
      toast.success(t("groups.deleted"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{group.groupName}</DialogTitle>
          <DialogDescription>{canManage ? t("groups.detailDesc") : t("groups.viewDesc")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : (
          <div className="space-y-6">
            {canManage && (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">{t("groups.rename")}</h4>
                <div className="flex gap-2">
                  <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} className="flex-1" />
                  <Button type="button" className="gap-1.5" onClick={() => void handleRename()} loading={update.isPending}>
                    <Pencil className="size-4" />
                    {t("common.save")}
                  </Button>
                </div>
              </section>
            )}

            <section>
              <h4 className="mb-2 text-sm font-semibold">{t("groups.members")}</h4>
              <ul className="space-y-2">
                {memberRows.length === 0 ? (
                  <li className="text-sm text-muted-foreground">{t("common.noRecords")}</li>
                ) : memberRows.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span>
                      {names[m.studentId] ?? `#${m.studentId}`}
                      {m.isLeader && <span className="ms-2 text-xs text-primary">({t("groups.leader")})</span>}
                    </span>
                    {canManage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => void handleRemoveMember(m.id)}
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {!canManage && hasProject && (
              <section>
                <h4 className="mb-2 text-sm font-semibold">{t("groups.advisors")}</h4>
                <ul className="space-y-2">
                  {advisorRows.length === 0 ? (
                    <li className="text-sm text-muted-foreground">{t("common.noRecords")}</li>
                  ) : advisorRows.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                      {advisorNames[a.advisorId] ?? `#${a.advisorId}`}
                      <span className="ms-2 text-xs text-muted-foreground">
                        ({advisorRoleLabels[a.advisorRoleId] ?? a.advisorRoleId})
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {canManage && (
              <>
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold">{t("groups.addMember")}</h4>
                  <div className="flex gap-2">
                    <AsyncSearchCombobox
                      value={studentId}
                      onValueChange={setStudentId}
                      onSearch={searchStudents}
                      placeholder={t("groups.selectStudent")}
                      searchPlaceholder={t("common.typeToSearch")}
                      emptyMessage={t("common.noRecords")}
                      loadMoreLabel={t("common.loadMore")}
                      searchingLabel={t("common.searching")}
                      className="flex-1"
                    />
                    <Button type="button" className="gap-1.5 shrink-0" onClick={() => void handleAddMember()} loading={addMember.isPending}>
                      <UserPlus className="size-4" />
                      {t("common.create")}
                    </Button>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-semibold">{t("groups.assignProject")}</h4>
                  <div className="flex gap-2">
                    <AsyncSearchCombobox
                      value={projectId}
                      onValueChange={(value, label) => {
                        setProjectId(value);
                        if (label) setProjectLabel(label);
                      }}
                      onSearch={searchProjects}
                      selectedLabel={projectLabel}
                      placeholder={t("groups.selectProject")}
                      searchPlaceholder={t("common.typeToSearch")}
                      emptyMessage={t("common.noRecords")}
                      loadMoreLabel={t("common.loadMore")}
                      searchingLabel={t("common.searching")}
                      className="flex-1"
                      disabled={hasProject}
                    />
                    <Button
                      type="button"
                      className="shrink-0"
                      onClick={() => void handleAssignProject()}
                      loading={assignProject.isPending}
                      disabled={hasProject || !projectId}
                    >
                      {t("common.save")}
                    </Button>
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold">{t("groups.advisors")}</h4>
                  {!hasProject ? (
                    <p className="text-sm text-muted-foreground">{t("groups.assignProjectFirst")}</p>
                  ) : (
                    <>
                      <ul className="space-y-2">
                        {advisorRows.length === 0 ? (
                          <li className="text-sm text-muted-foreground">{t("common.noRecords")}</li>
                        ) : advisorRows.map((a) => (
                          <li key={a.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                            <span>
                              {advisorNames[a.advisorId] ?? `#${a.advisorId}`}
                              <span className="ms-2 text-xs text-muted-foreground">
                                ({advisorRoleLabels[a.advisorRoleId] ?? a.advisorRoleId})
                              </span>
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => void handleRemoveAdvisor(a.id)}
                              aria-label={t("common.delete")}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      {hasProject && (
                        <div className="mt-3 space-y-2">
                          <h5 className="text-sm font-medium">{t("groups.assignAdvisor")}</h5>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <AsyncSearchCombobox
                              value={advisorId}
                              onValueChange={setAdvisorId}
                              onSearch={searchAdvisors}
                              placeholder={t("groups.selectAdvisor")}
                              searchPlaceholder={t("common.typeToSearch")}
                              emptyMessage={t("common.noRecords")}
                              loadMoreLabel={t("common.loadMore")}
                              searchingLabel={t("common.searching")}
                              className="flex-1"
                            />
                            <Combobox
                              options={advisorRoleOptions}
                              value={advisorRoleId}
                              onValueChange={setAdvisorRoleId}
                              placeholder={t("groups.selectRole")}
                              searchPlaceholder={t("common.typeToSearch")}
                              emptyMessage={t("common.noRecords")}
                              className="sm:w-48"
                            />
                            <Button
                              type="button"
                              className="shrink-0"
                              onClick={() => void handleAssignAdvisor()}
                              loading={assignAdvisor.isPending}
                              disabled={!advisorId}
                            >
                              {t("common.save")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>

                <section className="border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 text-destructive"
                    onClick={() => void handleDelete()}
                    loading={remove.isPending}
                  >
                    <Trash2 className="size-4" />
                    {t("groups.deleteGroup")}
                  </Button>
                </section>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
