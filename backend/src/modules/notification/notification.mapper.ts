import { Notification } from '@/database/entities/notification.entity';
import { Injectable } from '@nestjs/common';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationMapper {
  toResponse(entity: Notification): NotificationResponseDto {
    return {
      id: entity.id,
      personId: entity.personId,
      title: entity.title,
      message: entity.message,
      isRead: entity.isRead,
      createdAt: entity.createdAt,
    };
  }

  toResponseList(entities: Notification[]): NotificationResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
