"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMeetingMutations } from "@/hooks/api/use-meetings";
import { useSchedulableGroups } from "@/hooks/api/use-schedulable-groups";
import { useTranslation } from "@/providers/locale-provider";
import type { Meeting } from "@/types";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EditMeetingDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMeetingDialog({ meeting, open, onOpenChange }: EditMeetingDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    groupId: "",
    meetingDate: "",
    location: "",
    onlineLink: "",
    notes: "",
  });

  const { update } = useMeetingMutations();
  const { groups } = useSchedulableGroups();

  useEffect(() => {
    if (!meeting || !open) return;
    setForm({
      groupId: String(meeting.groupId),
      meetingDate: toDatetimeLocal(meeting.meetingDate),
      location: meeting.location ?? "",
      onlineLink: meeting.onlineLink ?? "",
      notes: meeting.notes ?? "",
    });
  }, [meeting, open]);

  const handleSave = async () => {
    if (!meeting || !form.meetingDate) {
      toast.error(t("meetings.dateRequired"));
      return;
    }
    if (new Date(form.meetingDate) < new Date()) {
      toast.error(t("meetings.pastDateError"));
      return;
    }

    try {
      await update.mutateAsync({
        id: meeting.id,
        groupId: Number(form.groupId),
        meetingDate: new Date(form.meetingDate).toISOString(),
        location: form.location || undefined,
        onlineLink: form.onlineLink || undefined,
        notes: form.notes || undefined,
      });
      toast.success(t("meetings.updated"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.loadError"));
    }
  };

  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("meetings.editTitle")}</DialogTitle>
          <DialogDescription>{t("meetings.editDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("groups.group")}</label>
            <Select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="mt-1.5">
              {(groups ?? []).map((g) => (
                <option key={g.id} value={g.id}>{g.groupName}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t("meetings.datetime")} *</label>
            <Input
              type="datetime-local"
              value={form.meetingDate}
              onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("meetings.location")}</label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">{t("meetings.onlineLink")}</label>
            <Input value={form.onlineLink} onChange={(e) => setForm({ ...form, onlineLink: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">{t("meetings.notes")}</label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => void handleSave()} loading={update.isPending}>{t("common.save")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
