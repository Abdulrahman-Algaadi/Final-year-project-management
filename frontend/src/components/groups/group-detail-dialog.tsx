"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, UserPlus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGroupMutations } from "@/hooks/api/use-group-mutations";
import { useProjects } from "@/hooks/api/use-projects";
import { useStudents } from "@/hooks/api/use-students";
import { fetchGroupById } from "@/lib/api/services/groups.service";
import { fetchReferenceData } from "@/lib/api/services/reference.service";
import { formatPersonName } from "@/lib/api/mappers/student.mapper";
import { ACTIVE_STUDENT_STATUS_ID } from "@/lib/api/constants";
import { useAppData } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { useTranslation } from "@/providers/locale-provider";
import type { Group } from "@/types";
import type { GroupDto } from "@/types/api";
import type { DemoGroupMember } from "@/lib/data/mock-data";

interface GroupDetailDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage?: boolean;
}

function buildDemoGroupDto(
  group: Group,
  members: DemoGroupMember[],
  projectId?: number,
): GroupDto {
  return {
    id: group.id,
    groupName: group.groupName,
    createdOn: group.createdOn,
    members: members.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      isLeader: m.isLeader,
      statusId: ACTIVE_STUDENT_STATUS_ID,
      assignmentDate: group.createdOn,
    })),
    project: projectId
      ? { id: group.id, projectId, assignedDate: group.createdOn }
      : undefined,
  };
}

export function GroupDetailDialog({ group, open, onOpenChange, canManage }: GroupDetailDialogProps) {
  const { t } = useTranslation();
  const { isDemo } = useSession();
  const {
    students: mockStudents,
    projects: mockProjects,
    getDemoGroupMembers,
    getDemoGroupProjectId,
    updateGroup: updateDemoGroup,
    deleteGroup: deleteDemoGroup,
    addGroupMember: addDemoMember,
    removeGroupMember: removeDemoMember,
    assignGroupProject: assignDemoProject,
  } = useAppData();

  const [detail, setDetail] = useState<GroupDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [names, setNames] = useState<Record<number, string>>({});

  const { addMember, removeMember, assignProject, update, remove } = useGroupMutations();
  const { data: apiStudents } = useStudents({ limit: 100 });
  const { data: apiProjects } = useProjects({ limit: 100 });

  const students = isDemo ? mockStudents : (apiStudents ?? []);
  const projects = isDemo ? mockProjects : (apiProjects ?? []);

  useEffect(() => {
    if (group) setGroupName(group.groupName);
  }, [group]);

  useEffect(() => {
    if (!open || !group) {
      setDetail(null);
      return;
    }

    if (isDemo) {
      const members = getDemoGroupMembers(group.id);
      const pid = getDemoGroupProjectId(group.id);
      setDetail(buildDemoGroupDto(group, members, pid));
      const nameMap: Record<number, string> = {};
      members.forEach((m) => { nameMap[m.studentId] = m.studentName; });
      setNames(nameMap);
      setProjectId(pid ? String(pid) : "");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchGroupById(group.id)
      .then((dto) => { if (!cancelled) setDetail(dto); })
      .catch(() => toast.error(t("states.loadError")))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, group, isDemo, t, getDemoGroupMembers, getDemoGroupProjectId]);

  useEffect(() => {
    if (isDemo || !detail?.members?.length) return;
    let cancelled = false;
    fetchReferenceData().then((ref) => {
      if (cancelled) return;
      const map: Record<number, string> = {};
      detail.members?.forEach((m) => {
        map[m.studentId] = formatPersonName(ref, m.studentId);
      });
      setNames(map);
    });
    return () => { cancelled = true; };
  }, [detail, isDemo]);

  const memberRows = useMemo(() => detail?.members ?? [], [detail]);

  const refreshDemoDetail = () => {
    if (!group || !isDemo) return;
    const members = getDemoGroupMembers(group.id);
    const pid = getDemoGroupProjectId(group.id);
    setDetail(buildDemoGroupDto(group, members, pid));
    const nameMap: Record<number, string> = {};
    members.forEach((m) => { nameMap[m.studentId] = m.studentName; });
    setNames(nameMap);
  };

  const handleAddMember = async () => {
    if (!group || !studentId) return;
    if (isDemo) {
      addDemoMember(group.id, Number(studentId));
      refreshDemoDetail();
      setStudentId("");
      toast.success(t("groups.memberAdded"));
      return;
    }
    try {
      const dto = await addMember.mutateAsync({
        groupId: group.id,
        studentId: Number(studentId),
        statusId: ACTIVE_STUDENT_STATUS_ID,
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
    if (isDemo) {
      removeDemoMember(group.id, memberId);
      refreshDemoDetail();
      toast.success(t("groups.memberRemoved"));
      return;
    }
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
    if (isDemo) {
      assignDemoProject(group.id, Number(projectId));
      refreshDemoDetail();
      toast.success(t("groups.projectAssigned"));
      return;
    }
    try {
      const dto = await assignProject.mutateAsync({
        groupId: group.id,
        projectId: Number(projectId),
      });
      setDetail(dto);
      toast.success(t("groups.projectAssigned"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  const handleRename = async () => {
    if (!group || !groupName.trim()) return;
    if (isDemo) {
      updateDemoGroup(group.id, groupName.trim());
      toast.success(t("groups.renamed"));
      return;
    }
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
    if (isDemo) {
      deleteDemoGroup(group.id);
      toast.success(t("groups.deleted"));
      onOpenChange(false);
      return;
    }
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
                  <Button type="button" className="gap-1.5" onClick={() => void handleRename()} loading={!isDemo && update.isPending}>
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

            {canManage && (
              <>
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold">{t("groups.addMember")}</h4>
                  <div className="flex gap-2">
                    <Select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="flex-1">
                      <option value="">{t("groups.selectStudent")}</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.registrationNo})
                        </option>
                      ))}
                    </Select>
                    <Button type="button" className="gap-1.5" onClick={() => void handleAddMember()} loading={!isDemo && addMember.isPending}>
                      <UserPlus className="size-4" />
                      {t("common.create")}
                    </Button>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-semibold">{t("groups.assignProject")}</h4>
                  <div className="flex gap-2">
                    <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="flex-1">
                      <option value="">{t("groups.selectProject")}</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </Select>
                    <Button type="button" onClick={() => void handleAssignProject()} loading={!isDemo && assignProject.isPending}>
                      {t("common.save")}
                    </Button>
                  </div>
                </section>

                <section className="border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 text-destructive"
                    onClick={() => void handleDelete()}
                    loading={!isDemo && remove.isPending}
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
