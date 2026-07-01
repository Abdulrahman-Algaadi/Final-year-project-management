import { Injectable } from '@nestjs/common';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { UserRole } from '@/shared/types/enums';
import { StudentRepository } from '@/modules/student/student.repository';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import {
  AdminDashboardDto,
  AdvisorDashboardDto,
  DashboardStatsDto,
  StudentDashboardDto,
} from './dto/dashboard-response.dto';
import { DashboardRepository } from './dashboard.repository';
import { DashboardErrors } from './dashboard.errors';

@Injectable()
export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository,
    private readonly studentRepository: StudentRepository,
    private readonly advisorRepository: AdvisorRepository,
  ) {}

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const [totalProjects, totalGroups, totalStudents, pendingSubmissions, pendingProjects, totalAdvisors, totalDepartments, upcomingMeetings] =
      await Promise.all([
        this.repository.countProjects(),
        this.repository.countGroups(),
        this.repository.countStudents(),
        this.repository.countPendingSubmissions(),
        this.repository.countPendingProjects(),
        this.repository.countAdvisors(),
        this.repository.countDepartments(),
        this.repository.countUpcomingMeetings(new Date()),
      ]);

    return {
      totalProjects,
      totalGroups,
      totalStudents,
      pendingSubmissions,
      pendingProjects,
      upcomingMeetings,
      totalAdvisors,
      totalDepartments,
    };
  }

  async getStudentDashboard(user: AuthenticatedUser): Promise<StudentDashboardDto> {
    const student = await this.studentRepository.findByPersonId(user.personId);
    if (!student) {
      throw DomainException.notFound('Student', user.personId);
    }

    const context = await this.repository.getStudentGroupContext(student.id);
    const [submissionCount, unreadNotifications] = await Promise.all([
      context.groupId ? this.repository.countSubmissionsByGroup(context.groupId) : Promise.resolve(0),
      this.repository.countUnreadNotifications(user.personId),
    ]);

    return {
      groupId: context.groupId,
      groupName: context.groupName,
      projectTitle: context.projectTitle,
      projectStatus: context.projectStatus,
      departmentName: context.departmentName,
      semesterName: context.semesterName,
      advisorName: context.advisorName,
      advisorEmail: context.advisorEmail,
      advisorDepartment: context.advisorDepartment,
      advisorDesignation: context.advisorDesignation,
      nextMeetingDate: context.nextMeetingDate,
      submissionCount,
      unreadNotifications,
    };
  }

  async getAdvisorDashboard(user: AuthenticatedUser): Promise<AdvisorDashboardDto> {
    const advisor = await this.advisorRepository.findById(user.personId);
    if (!advisor) {
      throw DomainException.notFound('Advisor', user.personId);
    }

    const [assignedProjects, upcomingMeetings, pendingSubmissions, evaluationsPending] = await Promise.all([
      this.repository.countAdvisorProjects(advisor.id),
      this.repository.countUpcomingMeetingsForAdvisor(advisor.id, new Date()),
      this.repository.countPendingSubmissionsForAdvisor(advisor.id),
      this.repository.countUnpublishedEvaluationsForAdvisor(advisor.id),
    ]);

    return {
      assignedProjects,
      upcomingMeetings,
      pendingSubmissions,
      evaluationsPending,
    };
  }

  async getDashboardForUser(user: AuthenticatedUser): Promise<DashboardStatsDto | StudentDashboardDto | AdvisorDashboardDto | AdminDashboardDto> {
    switch (user.role) {
      case UserRole.Student:
        return this.getStudentDashboard(user);
      case UserRole.Advisor:
        return this.getAdvisorDashboard(user);
      case UserRole.Admin:
      case UserRole.Coordinator:
        return this.getAdminDashboard();
      default:
        throw DomainException.businessRule('Dashboard not available for role', DashboardErrors.ROLE_NOT_SUPPORTED);
    }
  }
}
