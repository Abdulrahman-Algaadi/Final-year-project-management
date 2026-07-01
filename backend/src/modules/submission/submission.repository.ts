import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '@/database/entities/submission.entity';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { BaseRepository } from '@/shared/repositories/base.repository';
import { applySoftDeleteFilter } from '@/shared/utils/query.util';
import { paginateQuery } from '@/shared/utils/repository.util';

@Injectable()
export class SubmissionRepository extends BaseRepository<Submission> {
  constructor(@InjectRepository(Submission) repository: Repository<Submission>) {
    super(repository);
  }

  async findLatestVersion(groupId: number): Promise<Submission | null> {
    return this.repository.findOne({
      where: { groupId },
      order: { versionNo: 'DESC' },
    });
  }

  async findByGroupId(groupId: number): Promise<Submission[]> {
    return this.repository.find({
      where: { groupId },
      order: { versionNo: 'DESC' },
    });
  }

  async findAllForGroup(
    groupId: number,
    options: QueryOptions,
  ): Promise<{ items: Submission[]; meta: PaginationMeta }> {
    const qb = this.repository.createQueryBuilder('submission').where('submission.group_id = :groupId', { groupId });

    applySoftDeleteFilter(qb, 'submission', options.includeDeleted);

    if (options.search) {
      qb.andWhere('submission.title ILIKE :search', { search: `%${options.search}%` });
    }

    return paginateQuery(
      qb,
      'submission',
      { ...options, sortBy: options.sortBy ?? 'submittedAt', sortOrder: options.sortOrder ?? 'DESC' },
      'submittedAt',
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
  ): Promise<{ items: Submission[]; meta: PaginationMeta }> {
    const qb = this.repository
      .createQueryBuilder('submission')
      .innerJoin('group_project', 'gp', 'gp.group_id = submission.group_id')
      .innerJoin('project_advisor', 'pa', 'pa.project_id = gp.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId });

    if (options.search) {
      qb.andWhere('submission.title ILIKE :search', { search: `%${options.search}%` });
    }

    return paginateQuery(
      qb,
      'submission',
      { ...options, sortBy: options.sortBy ?? 'submittedAt', sortOrder: options.sortOrder ?? 'DESC' },
      'submittedAt',
    );
  }
}
