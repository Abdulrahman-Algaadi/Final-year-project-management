import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '@/database/entities/project.entity';
import { StudentGroup } from '@/database/entities/student-group.entity';
import { Student } from '@/database/entities/student.entity';
import { Submission } from '@/database/entities/submission.entity';
import { Meeting } from '@/database/entities/meeting.entity';
import { Notification } from '@/database/entities/notification.entity';
import { Advisor } from '@/database/entities/advisor.entity';
import { Department } from '@/database/entities/department.entity';
import { ProjectAdvisor } from '@/database/entities/project-advisor.entity';
import { GroupStudent } from '@/database/entities/group-student.entity';
import { GroupProject } from '@/database/entities/group-project.entity';
import { GroupEvaluation } from '@/database/entities/group-evaluation.entity';
import { SubmissionStatus, MeetingStatus, ProjectStatusName } from '@/shared/types/enums';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(StudentGroup) private readonly groupRepo: Repository<StudentGroup>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Submission) private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Meeting) private readonly meetingRepo: Repository<Meeting>,
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Advisor) private readonly advisorRepo: Repository<Advisor>,
    @InjectRepository(Department) private readonly departmentRepo: Repository<Department>,
    @InjectRepository(ProjectAdvisor) private readonly projectAdvisorRepo: Repository<ProjectAdvisor>,
    @InjectRepository(GroupStudent) private readonly groupStudentRepo: Repository<GroupStudent>,
    @InjectRepository(GroupProject) private readonly groupProjectRepo: Repository<GroupProject>,
    @InjectRepository(GroupEvaluation) private readonly groupEvaluationRepo: Repository<GroupEvaluation>,
  ) {}

  countProjects(): Promise<number> {
    return this.projectRepo.count();
  }

  countGroups(): Promise<number> {
    return this.groupRepo.count();
  }

  countStudents(): Promise<number> {
    return this.studentRepo.count();
  }

  countAdvisors(): Promise<number> {
    return this.advisorRepo.count();
  }

  countDepartments(): Promise<number> {
    return this.departmentRepo.count();
  }

  countPendingSubmissions(): Promise<number> {
    return this.submissionRepo.count({ where: { status: SubmissionStatus.Pending } });
  }

  countPendingProjects(): Promise<number> {
    return this.projectRepo
      .createQueryBuilder('project')
      .innerJoin('project.status', 'status')
      .where('status.status_name = :status', { status: ProjectStatusName.Pending })
      .getCount();
  }

  countUpcomingMeetings(from: Date): Promise<number> {
    return this.meetingRepo
      .createQueryBuilder('meeting')
      .where('meeting.meeting_date >= :from', { from })
      .andWhere('meeting.status = :status', { status: MeetingStatus.Scheduled })
      .getCount();
  }

  countUnreadNotifications(personId: number): Promise<number> {
    return this.notificationRepo.count({ where: { personId, isRead: false } });
  }

  countAdvisorProjects(advisorId: number): Promise<number> {
    return this.projectAdvisorRepo.count({ where: { advisorId } });
  }

  async getStudentGroupContext(studentId: number): Promise<{
    groupId?: number;
    groupName?: string;
    projectTitle?: string;
    projectStatus?: string;
    departmentName?: string;
    semesterName?: string;
    advisorName?: string;
    advisorEmail?: string;
    advisorDepartment?: string;
    advisorDesignation?: string;
    nextMeetingDate?: Date;
  }> {
    const membership = await this.groupStudentRepo.findOne({
      where: { studentId },
      relations: ['group'],
    });
    if (!membership) return {};

    const groupProject = await this.groupProjectRepo.findOne({
      where: { groupId: membership.groupId },
      relations: ['project', 'project.status', 'project.semester'],
    });

    const leaderMembership = await this.groupStudentRepo.findOne({
      where: { groupId: membership.groupId, isLeader: true },
      relations: ['student', 'student.department'],
    });

    let advisorName: string | undefined;
    let advisorEmail: string | undefined;
    let advisorDepartment: string | undefined;
    let advisorDesignation: string | undefined;
    if (groupProject?.projectId) {
      const projectAdvisor = await this.projectAdvisorRepo.findOne({
        where: { projectId: groupProject.projectId },
        relations: ['advisor', 'advisor.person', 'advisor.department', 'advisor.designation'],
      });
      const person = projectAdvisor?.advisor?.person;
      advisorName = person ? `${person.firstName} ${person.lastName}`.trim() : undefined;
      advisorEmail = person?.email;
      advisorDepartment = projectAdvisor?.advisor?.department?.name;
      advisorDesignation = projectAdvisor?.advisor?.designation?.value;
    }

    const nextMeeting = await this.meetingRepo
      .createQueryBuilder('meeting')
      .where('meeting.group_id = :groupId', { groupId: membership.groupId })
      .andWhere('meeting.status = :status', { status: MeetingStatus.Scheduled })
      .andWhere('meeting.meeting_date >= :from', { from: new Date() })
      .orderBy('meeting.meeting_date', 'ASC')
      .getOne();

    return {
      groupId: membership.groupId,
      groupName: membership.group?.groupName,
      projectTitle: groupProject?.project?.title,
      projectStatus: groupProject?.project?.status?.statusName,
      departmentName: leaderMembership?.student?.department?.name,
      semesterName: groupProject?.project?.semester?.name,
      advisorName,
      advisorEmail,
      advisorDepartment,
      advisorDesignation,
      nextMeetingDate: nextMeeting?.meetingDate,
    };
  }

  countSubmissionsByGroup(groupId: number): Promise<number> {
    return this.submissionRepo.count({ where: { groupId } });
  }

  countPendingSubmissionsForAdvisor(advisorId: number): Promise<number> {
    return this.submissionRepo
      .createQueryBuilder('submission')
      .innerJoin('group_project', 'gp', 'gp.group_id = submission.group_id')
      .innerJoin('project_advisor', 'pa', 'pa.project_id = gp.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('submission.status = :status', { status: SubmissionStatus.Pending })
      .getCount();
  }

  countUpcomingMeetingsForAdvisor(advisorId: number, from: Date): Promise<number> {
    return this.meetingRepo
      .createQueryBuilder('meeting')
      .where('meeting.advisor_id = :advisorId', { advisorId })
      .andWhere('meeting.meeting_date >= :from', { from })
      .andWhere('meeting.status = :status', { status: MeetingStatus.Scheduled })
      .getCount();
  }

  countUnpublishedEvaluationsForAdvisor(advisorId: number): Promise<number> {
    return this.groupEvaluationRepo
      .createQueryBuilder('ge')
      .innerJoin('group_project', 'gp', 'gp.group_id = ge.group_id')
      .innerJoin('project_advisor', 'pa', 'pa.project_id = gp.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('ge.is_published = false')
      .getCount();
  }
}
