import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '@/database/entities/project.entity';
import { Student } from '@/database/entities/student.entity';
import { GroupEvaluation } from '@/database/entities/group-evaluation.entity';
import { Evaluation } from '@/database/entities/evaluation.entity';
import { Submission } from '@/database/entities/submission.entity';

@Injectable()
export class ReportingRepository {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(GroupEvaluation) private readonly groupEvalRepo: Repository<GroupEvaluation>,
    @InjectRepository(Evaluation) private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(Submission) private readonly submissionRepo: Repository<Submission>,
  ) {}

  async countProjectsByStatus(): Promise<{ statusName: string; count: number }[]> {
    return this.projectRepo
      .createQueryBuilder('project')
      .select('status.status_name', 'statusName')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('project.status', 'status')
      .groupBy('status.status_name')
      .getRawMany();
  }

  async countStudentsByDepartment(): Promise<{ departmentId: number; departmentName: string; count: number }[]> {
    return this.studentRepo
      .createQueryBuilder('student')
      .select('department.id', 'departmentId')
      .addSelect('department.name', 'departmentName')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('student.department', 'department')
      .groupBy('department.id')
      .addGroupBy('department.name')
      .getRawMany();
  }

  async getEvaluationSummaries(): Promise<
    { evaluationId: number; evaluationName: string; groupsEvaluated: number; averageMarks: number }[]
  > {
    return this.groupEvalRepo
      .createQueryBuilder('ge')
      .select('evaluation.id', 'evaluationId')
      .addSelect('evaluation.name', 'evaluationName')
      .addSelect('COUNT(DISTINCT ge.group_id)', 'groupsEvaluated')
      .addSelect('AVG(ge.obtained_marks)', 'averageMarks')
      .innerJoin('ge.evaluation', 'evaluation')
      .groupBy('evaluation.id')
      .addGroupBy('evaluation.name')
      .getRawMany();
  }

  async countSubmissionsByStatus(): Promise<{ status: string; count: number }[]> {
    return this.submissionRepo
      .createQueryBuilder('submission')
      .select('submission.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('submission.status')
      .getRawMany();
  }

  async countProjectsByDepartment(): Promise<{ departmentId: number; departmentName: string; count: number }[]> {
    return this.projectRepo
      .createQueryBuilder('project')
      .select('department.id', 'departmentId')
      .addSelect('department.name', 'departmentName')
      .addSelect('COUNT(DISTINCT project.id)', 'count')
      .innerJoin('group_project', 'gp', 'gp.project_id = project.id')
      .innerJoin('group_student', 'gs', 'gs.group_id = gp.group_id AND gs.is_leader = true')
      .innerJoin('student', 'student', 'student.id = gs.student_id')
      .innerJoin('department', 'department', 'department.id = student.department_id')
      .where('project.deleted_at IS NULL')
      .groupBy('department.id')
      .addGroupBy('department.name')
      .getRawMany();
  }
}
