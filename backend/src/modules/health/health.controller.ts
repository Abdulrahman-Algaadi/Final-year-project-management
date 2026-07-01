import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/shared/decorators/auth.decorators';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'API health check' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
