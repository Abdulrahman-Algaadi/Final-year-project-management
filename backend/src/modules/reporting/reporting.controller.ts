import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/shared/decorators/auth.decorators';
import { Permission } from '@/shared/types/enums';
import { ReportingService } from './reporting.service';
import {
  EvaluationSummaryReportDto,
  ProjectByDepartmentReportDto,
  ProjectSummaryReportDto,
  StudentEnrollmentReportDto,
  SubmissionSummaryReportDto,
} from './dto/report-response.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('projects/summary')
  @RequirePermissions(Permission.ReportRead)
  @ApiOperation({ summary: 'Project status summary report' })
  getProjectSummary(): Promise<ProjectSummaryReportDto> {
    return this.reportingService.getProjectSummary();
  }

  @Get('students/enrollment')
  @RequirePermissions(Permission.ReportRead)
  @ApiOperation({ summary: 'Student enrollment by department' })
  getStudentEnrollment(): Promise<StudentEnrollmentReportDto[]> {
    return this.reportingService.getStudentEnrollment();
  }

  @Get('evaluations/summary')
  @RequirePermissions(Permission.ReportRead)
  @ApiOperation({ summary: 'Evaluation performance summary' })
  getEvaluationSummaries(): Promise<EvaluationSummaryReportDto[]> {
    return this.reportingService.getEvaluationSummaries();
  }

  @Get('submissions/summary')
  @RequirePermissions(Permission.ReportRead)
  @ApiOperation({ summary: 'Submission status summary' })
  getSubmissionSummary(): Promise<SubmissionSummaryReportDto> {
    return this.reportingService.getSubmissionSummary();
  }

  @Get('projects/by-department')
  @RequirePermissions(Permission.ReportRead)
  @ApiOperation({ summary: 'Assigned projects by department' })
  getProjectsByDepartment(): Promise<ProjectByDepartmentReportDto[]> {
    return this.reportingService.getProjectsByDepartment();
  }
}
