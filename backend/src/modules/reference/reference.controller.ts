import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/shared/decorators/auth.decorators';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Permission } from '@/shared/types/enums';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { ReferenceService } from './reference.service';
import { ReferenceResponseDto } from './dto/reference-response.dto';

@ApiTags('reference')
@ApiBearerAuth()
@Controller('reference')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get()
  @RequirePermissions(
    Permission.DashboardAdmin,
    Permission.DashboardAdvisor,
    Permission.DashboardStudent,
  )
  @ApiOperation({ summary: 'Role-scoped reference data for UI mappers' })
  getReference(@CurrentUser() user: AuthenticatedUser): Promise<ReferenceResponseDto> {
    return this.referenceService.getForUser(user);
  }
}
