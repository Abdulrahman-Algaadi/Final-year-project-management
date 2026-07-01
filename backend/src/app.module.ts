import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from '@/config/config.module';
import { DatabaseModule } from '@/database/database.module';
import { SharedModule } from '@/shared/shared.module';
import { AuthorizationModule } from '@/modules/authorization/authorization.module';
import { JwtAuthGuard } from '@/modules/authorization/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/authorization/guards/permissions.guard';
import { AuthenticationModule } from '@/modules/authentication/authentication.module';
import { DepartmentModule } from '@/modules/department/department.module';
import { SemesterModule } from '@/modules/semester/semester.module';
import { LookupModule } from '@/modules/lookup/lookup.module';
import { StudentModule } from '@/modules/student/student.module';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { ProjectModule } from '@/modules/project/project.module';
import { GroupModule } from '@/modules/group/group.module';
import { EvaluationModule } from '@/modules/evaluation/evaluation.module';
import { SubmissionModule } from '@/modules/submission/submission.module';
import { MeetingModule } from '@/modules/meeting/meeting.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { ReportingModule } from '@/modules/reporting/reporting.module';
import { ReferenceModule } from '@/modules/reference/reference.module';
import { HealthModule } from '@/modules/health/health.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    SharedModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('throttle.ttl') ?? 60,
            limit: config.get<number>('throttle.limit') ?? 100,
          },
        ],
      }),
    }),
    AuthorizationModule,
    AuthenticationModule,
    DepartmentModule,
    SemesterModule,
    LookupModule,
    StudentModule,
    AdvisorModule,
    ProjectModule,
    GroupModule,
    EvaluationModule,
    SubmissionModule,
    MeetingModule,
    NotificationModule,
    AuditModule,
    ReportingModule,
    DashboardModule,
    ReferenceModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
