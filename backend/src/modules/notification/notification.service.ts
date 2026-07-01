import { Injectable } from '@nestjs/common';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { AuthenticatedUser, PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { GroupStudentRepository } from '@/modules/group/group.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationRepository } from './notification.repository';
import { NotificationMapper } from './notification.mapper';
import { NotificationErrors } from './notification.errors';

@Injectable()
export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly mapper: NotificationMapper,
    private readonly groupStudentRepository: GroupStudentRepository,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: NotificationResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(options);
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findOwn(user: AuthenticatedUser): Promise<NotificationResponseDto[]> {
    const items = await this.repository.findByPersonId(user.personId);
    return this.mapper.toResponseList(items);
  }

  async findOwnPaginated(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: NotificationResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findByPersonIdPaginated(user.personId, {
      ...options,
      sortBy: options.sortBy ?? 'createdAt',
      sortOrder: options.sortOrder ?? 'DESC',
    });
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findUnread(user: AuthenticatedUser): Promise<NotificationResponseDto[]> {
    const items = await this.repository.findUnreadByPersonId(user.personId);
    return this.mapper.toResponseList(items);
  }

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const entity = this.repository.create({
      personId: dto.personId,
      title: dto.title.trim(),
      message: dto.message.trim(),
      isRead: false,
      createdAt: new Date(),
    });
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async markAsRead(id: number, user: AuthenticatedUser): Promise<NotificationResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Notification', id);
    }
    if (entity.personId !== user.personId) {
      throw DomainException.forbidden('Not your notification', NotificationErrors.NOT_OWNER);
    }
    entity.isRead = true;
    const saved = await this.repository.save(entity);
    return this.mapper.toResponse(saved);
  }

  async markAllAsRead(user: AuthenticatedUser): Promise<{ updated: number }> {
    const updated = await this.repository.markAllAsReadByPersonId(user.personId);
    return { updated };
  }

  async notifyGroupMembers(groupId: number, title: string, message: string): Promise<void> {
    const members = await this.groupStudentRepository.findByGroupId(groupId);
    await Promise.all(
      members.map((member) =>
        this.create({
          personId: member.studentId,
          title,
          message,
        }),
      ),
    );
  }
}
