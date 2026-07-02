import type { Meeting } from "@/types";
import type { MeetingDto, ReferenceData } from "@/types/api";
import { formatPersonName } from "@/lib/api/mappers/student.mapper";

function formatAdvisorName(dto: MeetingDto, ref?: ReferenceData): string {
  const fromDto = [dto.advisorFirstName, dto.advisorLastName].filter(Boolean).join(" ");
  if (fromDto) return fromDto;
  return formatPersonName(ref, dto.advisorId);
}

export function mapMeeting(dto: MeetingDto, ref?: ReferenceData): Meeting {
  return {
    id: dto.id,
    groupId: dto.groupId,
    groupName: ref?.groups.get(dto.groupId)?.groupName ?? `Group #${dto.groupId}`,
    advisorName: formatAdvisorName(dto, ref),
    meetingDate: typeof dto.meetingDate === "string" ? dto.meetingDate : new Date(dto.meetingDate).toISOString(),
    location: dto.location,
    onlineLink: dto.onlineLink,
    status: dto.status,
    notes: dto.notes,
  };
}

export function mapMeetingList(dtos: MeetingDto[], ref?: ReferenceData): Meeting[] {
  return dtos.map((d) => mapMeeting(d, ref));
}
