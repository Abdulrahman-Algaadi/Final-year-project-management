import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { UserRole } from '@/shared/types/enums';
import { TtlCache } from '@/shared/utils/ttl-cache.util';
import { AdvisorService } from '@/modules/advisor/advisor.service';
import { DepartmentService } from '@/modules/department/department.service';
import { EvaluationService } from '@/modules/evaluation/evaluation.service';
import { GroupService } from '@/modules/group/group.service';
import { ProjectService } from '@/modules/project/project.service';
import { SemesterService } from '@/modules/semester/semester.service';
import { StudentService } from '@/modules/student/student.service';
import { AdvisorResponseDto } from '@/modules/advisor/dto/advisor-response.dto';
import { ReferenceResponseDto } from './dto/reference-response.dto';

const LOAD_ALL = { page: 1, limit: 500 };
const REFERENCE_CACHE_MS = 3 * 60_000;

@Injectable()
export class ReferenceService {
  private readonly cache = new TtlCache<ReferenceResponseDto>(REFERENCE_CACHE_MS);

  constructor(
    private readonly departmentService: DepartmentService,
    private readonly semesterService: SemesterService,
    private readonly studentService: StudentService,
    private readonly projectService: ProjectService,
    private readonly groupService: GroupService,
    private readonly evaluationService: EvaluationService,
    private readonly advisorService: AdvisorService,
  ) {}

  async getForUser(user: AuthenticatedUser): Promise<ReferenceResponseDto> {
    const cacheKey = `${user.userAccountId}:${user.role}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.buildForUser(user);
    this.cache.set(cacheKey, result);
    return result;
  }

  private async buildForUser(user: AuthenticatedUser): Promise<ReferenceResponseDto> {
    const privileged = user.role === UserRole.Admin || user.role === UserRole.Coordinator;
    const isAdvisor = user.role === UserRole.Advisor;
    const isStudent = user.role === UserRole.Student;

    const [departments, semesters, students, projects, evaluations, advisors] = await Promise.all([
      privileged ? this.departmentService.findAll(LOAD_ALL).then((r) => r.items) : Promise.resolve([]),
      privileged ? this.semesterService.findAll(LOAD_ALL).then((r) => r.items) : Promise.resolve([]),
      privileged || isAdvisor
        ? this.studentService.findAllForUser(user, LOAD_ALL).then((r) => r.items)
        : Promise.resolve([]),
      this.projectService.findAllForUser(user, LOAD_ALL).then((r) => r.items),
      this.evaluationService.findAll(LOAD_ALL).then((r) => r.items),
      this.loadAdvisors(user),
    ]);

    let groups: { id: number; groupName: string }[] = [];
    if (privileged || isAdvisor) {
      groups = (await this.groupService.findAllForUser(user, LOAD_ALL)).items;
    } else if (isStudent) {
      try {
        const own = await this.groupService.findOwn(user);
        groups = [own];
      } catch {
        groups = [];
      }
    }

    return {
      departments: departments.map((d) => ({ id: d.id, name: d.name, code: d.code })),
      semesters: semesters.map((s) => ({ id: s.id, name: s.name })),
      students: students.map((s) => ({
        id: s.id,
        firstName: s.firstName ?? '',
        lastName: s.lastName ?? '',
        email: s.email ?? '',
        registrationNo: s.registrationNo,
      })),
      projects: projects.map((p) => ({ id: p.id, title: p.title })),
      groups: groups.map((g) => ({ id: g.id, groupName: g.groupName })),
      evaluations: evaluations.map((e) => ({
        id: e.id,
        name: e.name,
        totalMarks: e.totalMarks,
      })),
      advisors: advisors.map((a) => ({
        id: a.id,
        firstName: a.firstName ?? '',
        lastName: a.lastName ?? '',
      })),
    };
  }

  private async loadAdvisors(user: AuthenticatedUser): Promise<AdvisorResponseDto[]> {
    const privileged = user.role === UserRole.Admin || user.role === UserRole.Coordinator;

    if (privileged) {
      return (await this.advisorService.findAll(LOAD_ALL)).items;
    }

    if (user.role === UserRole.Advisor) {
      try {
        const advisor = await this.advisorService.findById(user.personId);
        return [advisor];
      } catch {
        return [];
      }
    }

    if (user.role === UserRole.Student) {
      try {
        const own = await this.groupService.findOwn(user);
        const advisorIds = [...new Set((own.advisors ?? []).map((assignment) => assignment.advisorId))];
        const advisors = await Promise.all(
          advisorIds.map(async (id) => {
            try {
              return await this.advisorService.findById(id);
            } catch {
              return null;
            }
          }),
        );
        return advisors.filter((advisor): advisor is AdvisorResponseDto => advisor != null);
      } catch {
        return [];
      }
    }

    return [];
  }
}
