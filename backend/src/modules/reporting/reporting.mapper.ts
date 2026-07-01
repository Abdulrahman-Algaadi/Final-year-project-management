import { Injectable } from '@nestjs/common';
import { ProjectStatusName, SubmissionStatus } from '@/shared/types/enums';
import {
  EvaluationSummaryReportDto,
  ProjectByDepartmentReportDto,
  ProjectSummaryReportDto,
  StudentEnrollmentReportDto,
  SubmissionSummaryReportDto,
} from './dto/report-response.dto';
import { ReportingRepository } from './reporting.repository';

@Injectable()
export class ReportingMapper {
  toProjectSummary(rows: { statusName: string; count: number }[]): ProjectSummaryReportDto {
    const map = new Map(rows.map((r) => [r.statusName, Number(r.count)]));
    return {
      totalProjects: rows.reduce((sum, r) => sum + Number(r.count), 0),
      pending: map.get(ProjectStatusName.Pending) ?? 0,
      ongoing: map.get(ProjectStatusName.Ongoing) ?? 0,
      completed: map.get(ProjectStatusName.Completed) ?? 0,
      archived: map.get(ProjectStatusName.Archived) ?? 0,
    };
  }

  toEnrollmentReport(
    rows: { departmentId: number; departmentName: string; count: number }[],
  ): StudentEnrollmentReportDto[] {
    return rows.map((r) => ({
      departmentId: Number(r.departmentId),
      departmentName: r.departmentName,
      studentCount: Number(r.count),
    }));
  }

  toEvaluationSummaries(
    rows: { evaluationId: number; evaluationName: string; groupsEvaluated: number; averageMarks: number }[],
  ): EvaluationSummaryReportDto[] {
    return rows.map((r) => ({
      evaluationId: Number(r.evaluationId),
      evaluationName: r.evaluationName,
      groupsEvaluated: Number(r.groupsEvaluated),
      averageMarks: parseFloat(Number(r.averageMarks).toFixed(2)),
    }));
  }

  toSubmissionSummary(rows: { status: string; count: number }[]): SubmissionSummaryReportDto {
    const map = new Map(rows.map((r) => [r.status, Number(r.count)]));
    const pending = map.get(SubmissionStatus.Pending) ?? 0;
    const approved = map.get(SubmissionStatus.Approved) ?? 0;
    const rejected = map.get(SubmissionStatus.Rejected) ?? 0;
    const revisionRequired = map.get(SubmissionStatus.RevisionRequired) ?? 0;
    return {
      total: pending + approved + rejected + revisionRequired,
      pending,
      approved,
      rejected,
      revisionRequired,
    };
  }

  toProjectsByDepartment(
    rows: { departmentId: number; departmentName: string; count: number }[],
  ): ProjectByDepartmentReportDto[] {
    return rows.map((r) => ({
      departmentId: Number(r.departmentId),
      departmentName: r.departmentName,
      projectCount: Number(r.count),
    }));
  }
}
