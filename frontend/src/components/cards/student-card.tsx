"use client";

import { GraduationCap, Mail, Hash, Building2, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EntityCard } from "@/components/cards/entity-card";
import { CardActions } from "@/components/cards/card-actions";
import { InfoRow } from "@/components/cards/info-row";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/providers/locale-provider";
import type { Student } from "@/types";

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

interface StudentCardProps {
  student: Student;
  canManage?: boolean;
  onEdit?: () => void;
}

export function StudentCard({ student, canManage, onEdit }: StudentCardProps) {
  const { t } = useTranslation();

  return (
    <EntityCard
      header={
        <div className="flex items-start gap-3">
          <Avatar className="size-11 shrink-0 ring-2 ring-background">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-snug">
              {student.firstName} {student.lastName}
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="font-normal">
                <Building2 className="me-1 size-3 shrink-0" />
                {student.department}
              </Badge>
              <StatusBadge status={student.status} />
            </div>
          </div>
        </div>
      }
      footer={
        canManage ? (
          <CardActions>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
              <Pencil className="size-3.5 shrink-0" />
              {t("common.edit")}
            </Button>
          </CardActions>
        ) : undefined
      }
    >
      {student.email ? (
        <InfoRow label={t("students.email")} value={student.email} icon={<Mail className="size-3.5" />} ltr />
      ) : null}
      <InfoRow label={t("students.registration")} value={student.registrationNo} icon={<Hash className="size-3.5" />} ltr />
      <InfoRow label={t("students.semester")} value={student.semester} icon={<Calendar className="size-3.5" />} />
      <InfoRow label={t("students.year")} value={student.enrollmentYear} icon={<GraduationCap className="size-3.5" />} ltr />
    </EntityCard>
  );
}
