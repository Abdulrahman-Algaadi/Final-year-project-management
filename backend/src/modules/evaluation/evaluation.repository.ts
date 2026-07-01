import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from '@/database/entities/evaluation.entity';
import { GroupEvaluation } from '@/database/entities/group-evaluation.entity';
import { ProjectAdvisor } from '@/database/entities/project-advisor.entity';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { BaseRepository } from '@/shared/repositories/base.repository';
import { paginateQuery } from '@/shared/utils/repository.util';

@Injectable()
export class EvaluationRepository extends BaseRepository<Evaluation> {
  constructor(@InjectRepository(Evaluation) repository: Repository<Evaluation>) {
    super(repository);
  }
}

@Injectable()
export class GroupEvaluationRepository {
  constructor(@InjectRepository(GroupEvaluation) private readonly repository: Repository<GroupEvaluation>) {}

  async findByGroupAndEvaluation(groupId: number, evaluationId: number): Promise<GroupEvaluation | null> {
    return this.repository.findOne({ where: { groupId, evaluationId } });
  }

  async findById(id: number): Promise<GroupEvaluation | null> {
    return this.repository.findOne({ where: { id }, relations: ['evaluation'] });
  }

  async findAllByGroup(groupId: number): Promise<GroupEvaluation[]> {
    return this.repository.find({ where: { groupId }, relations: ['evaluation'] });
  }

  async findPublishedByGroup(groupId: number): Promise<GroupEvaluation[]> {
    return this.repository.find({
      where: { groupId, isPublished: true },
      relations: ['evaluation'],
    });
  }

  async findAllPaginated(
    options: QueryOptions,
    advisorId?: number,
  ): Promise<{ items: GroupEvaluation[]; meta: PaginationMeta }> {
    const qb = this.repository
      .createQueryBuilder('ge')
      .leftJoinAndSelect('ge.evaluation', 'evaluation')
      .leftJoinAndSelect('ge.group', 'group');

    if (advisorId) {
      qb.innerJoin('group_project', 'gp', 'gp.group_id = ge.group_id')
        .innerJoin('project_advisor', 'pa', 'pa.project_id = gp.project_id')
        .andWhere('pa.advisor_id = :advisorId', { advisorId });
    }

    if (options.search) {
      qb.andWhere('(group.group_name ILIKE :search OR evaluation.name ILIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    return paginateQuery(
      qb,
      'ge',
      { ...options, sortBy: options.sortBy ?? 'evaluationDate', sortOrder: options.sortOrder ?? 'DESC' },
      'evaluationDate',
    );
  }

  create(data: Partial<GroupEvaluation>): GroupEvaluation {
    return this.repository.create(data);
  }

  async save(entity: GroupEvaluation): Promise<GroupEvaluation> {
    return this.repository.save(entity);
  }
}

@Injectable()
export class ProjectAdvisorLookupRepository {
  constructor(@InjectRepository(ProjectAdvisor) private readonly repository: Repository<ProjectAdvisor>) {}

  async isAdvisorAssignedToGroupProject(advisorId: number, groupId: number): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('pa')
      .innerJoin('group_project', 'gp', 'gp.project_id = pa.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('gp.group_id = :groupId', { groupId })
      .getCount();
    return count > 0;
  }

  async findPrimaryAdvisorForGroup(groupId: number): Promise<number | null> {
    const row = await this.repository
      .createQueryBuilder('pa')
      .select('pa.advisor_id', 'advisorId')
      .innerJoin('group_project', 'gp', 'gp.project_id = pa.project_id')
      .where('gp.group_id = :groupId', { groupId })
      .orderBy('pa.id', 'ASC')
      .limit(1)
      .getRawOne();
    return row ? Number(row.advisorId) : null;
  }
}
