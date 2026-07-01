import { Injectable } from '@nestjs/common';
import {
  EvaluationSummaryReportDto,
  ProjectByDepartmentReportDto,
  ProjectSummaryReportDto,
  StudentEnrollmentReportDto,
  SubmissionSummaryReportDto,
} from './dto/report-response.dto';
import { ReportingRepository } from './reporting.repository';
import { ReportingMapper } from './reporting.mapper';

@Injectable()
export class ReportingService {
  constructor(
    private readonly repository: ReportingRepository,
    private readonly mapper: ReportingMapper,
  ) {}

  async getProjectSummary(): Promise<ProjectSummaryReportDto> {
    const rows = await this.repository.countProjectsByStatus();
    return this.mapper.toProjectSummary(rows);
  }

  async getStudentEnrollment(): Promise<StudentEnrollmentReportDto[]> {
    const rows = await this.repository.countStudentsByDepartment();
    return this.mapper.toEnrollmentReport(rows);
  }

  async getEvaluationSummaries(): Promise<EvaluationSummaryReportDto[]> {
    const rows = await this.repository.getEvaluationSummaries();
    return this.mapper.toEvaluationSummaries(rows);
  }

  async getSubmissionSummary(): Promise<SubmissionSummaryReportDto> {
    const rows = await this.repository.countSubmissionsByStatus();
    return this.mapper.toSubmissionSummary(rows);
  }

  async getProjectsByDepartment(): Promise<ProjectByDepartmentReportDto[]> {
    const rows = await this.repository.countProjectsByDepartment();
    return this.mapper.toProjectsByDepartment(rows);
  }
}
