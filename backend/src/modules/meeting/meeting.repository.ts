import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from '@/database/entities/meeting.entity';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { BaseRepository } from '@/shared/repositories/base.repository';
import { applySoftDeleteFilter } from '@/shared/utils/query.util';
import { paginateQuery } from '@/shared/utils/repository.util';

@Injectable()
export class MeetingRepository extends BaseRepository<Meeting> {
  constructor(@InjectRepository(Meeting) repository: Repository<Meeting>) {
    super(repository);
  }

  async findByGroupId(groupId: number): Promise<Meeting[]> {
    return this.repository.find({ where: { groupId }, order: { meetingDate: 'DESC' } });
  }

  async findAllForGroup(
    groupId: number,
    options: QueryOptions,
  ): Promise<{ items: Meeting[]; meta: PaginationMeta }> {
    const qb = this.repository.createQueryBuilder('meeting').where('meeting.group_id = :groupId', { groupId });

    applySoftDeleteFilter(qb, 'meeting', options.includeDeleted);

    if (options.search) {
      qb.andWhere('(meeting.location ILIKE :search OR meeting.notes ILIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    return paginateQuery(
      qb,
      'meeting',
      { ...options, sortBy: options.sortBy ?? 'meetingDate', sortOrder: options.sortOrder ?? 'DESC' },
      'meetingDate',
    );
  }

  async isAdvisorAssignedToGroup(advisorId: number, groupId: number): Promise<boolean> {
    const count = await this.repository.manager
      .createQueryBuilder()
      .select('1')
      .from('project_advisor', 'pa')
      .innerJoin('group_project', 'gp', 'gp.project_id = pa.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('gp.group_id = :groupId', { groupId })
      .getCount();
    return count > 0;
  }

  async findAllForAdvisor(
    advisorId: number,
    options: QueryOptions,
  ): Promise<{ items: Meeting[]; meta: PaginationMeta }> {
    const qb = this.repository.createQueryBuilder('meeting').where('meeting.advisor_id = :advisorId', {
      advisorId,
    });

    applySoftDeleteFilter(qb, 'meeting', options.includeDeleted);

    if (options.search) {
      qb.andWhere('(meeting.location ILIKE :search OR meeting.notes ILIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    return paginateQuery(
      qb,
      'meeting',
      { ...options, sortBy: options.sortBy ?? 'meetingDate', sortOrder: options.sortOrder ?? 'DESC' },
      'meetingDate',
    );
  }
}
