import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@/database/entities/notification.entity';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { findAllPaginated, paginateQuery } from '@/shared/utils/repository.util';

@Injectable()
export class NotificationRepository {
  constructor(@InjectRepository(Notification) private readonly repository: Repository<Notification>) {}

  async findById(id: number): Promise<Notification | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByPersonId(personId: number): Promise<Notification[]> {
    return this.repository.find({
      where: { personId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPersonIdPaginated(
    personId: number,
    options: QueryOptions,
  ): Promise<{ items: Notification[]; meta: PaginationMeta }> {
    const qb = this.repository
      .createQueryBuilder('notification')
      .where('notification.person_id = :personId', { personId });

    if (options.search) {
      qb.andWhere('(notification.title ILIKE :search OR notification.message ILIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    return paginateQuery(qb, 'notification', options, 'createdAt');
  }

  async findUnreadByPersonId(personId: number): Promise<Notification[]> {
    return this.repository.find({
      where: { personId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(options: QueryOptions): Promise<{ items: Notification[]; meta: PaginationMeta }> {
    return findAllPaginated(this.repository, 'notification', options, ['title', 'message'], [], 'createdAt');
  }

  async markAllAsReadByPersonId(personId: number): Promise<number> {
    const result = await this.repository.update({ personId, isRead: false }, { isRead: true });
    return result.affected ?? 0;
  }

  create(data: Partial<Notification>): Notification {
    return this.repository.create(data);
  }

  async save(entity: Notification): Promise<Notification> {
    return this.repository.save(entity);
  }
}
