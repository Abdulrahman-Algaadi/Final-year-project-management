import { Meeting } from '@/database/entities/meeting.entity';
import { Injectable } from '@nestjs/common';
import { MeetingResponseDto } from './dto/meeting-response.dto';

@Injectable()
export class MeetingMapper {
  toResponse(entity: Meeting): MeetingResponseDto {
    return {
      id: entity.id,
      groupId: entity.groupId,
      advisorId: entity.advisorId,
      meetingDate: entity.meetingDate,
      location: entity.location,
      notes: entity.notes,
      status: entity.status,
      onlineLink: entity.onlineLink,
    };
  }

  toResponseList(entities: Meeting[]): MeetingResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
