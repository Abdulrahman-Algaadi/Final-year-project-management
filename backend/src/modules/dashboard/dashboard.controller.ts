import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/shared/decorators/auth.decorators';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Permission } from '@/shared/types/enums';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { DashboardService } from './dashboard.service';
import {
  AdminDashboardDto,
  AdvisorDashboardDto,
  StudentDashboardDto,
} from './dto/dashboard-response.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @RequirePermissions(
    Permission.DashboardAdmin,
    Permission.DashboardAdvisor,
    Permission.DashboardStudent,
  )
  @ApiOperation({ summary: 'Role-based dashboard' })
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getDashboardForUser(user);
  }

  @Get('admin')
  @RequirePermissions(Permission.DashboardAdmin)
  getAdminDashboard(): Promise<AdminDashboardDto> {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('advisor')
  @RequirePermissions(Permission.DashboardAdvisor)
  getAdvisorDashboard(@CurrentUser() user: AuthenticatedUser): Promise<AdvisorDashboardDto> {
    return this.dashboardService.getAdvisorDashboard(user);
  }

  @Get('student')
  @RequirePermissions(Permission.DashboardStudent)
  getStudentDashboard(@CurrentUser() user: AuthenticatedUser): Promise<StudentDashboardDto> {
    return this.dashboardService.getStudentDashboard(user);
  }
}
