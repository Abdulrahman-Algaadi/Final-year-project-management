import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/shared/decorators/auth.decorators';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { AuthenticationService } from './authentication.service';
import { LoginCallbackDto, SyncProfileDto } from './dto/auth.dto';
import { AuthProfileResponseDto, AuthSessionResponseDto, LoginCallbackResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('callback')
  @ApiOperation({ summary: 'Supabase login callback – sync session and profile' })
  handleCallback(@Body() dto: LoginCallbackDto): Promise<LoginCallbackResponseDto> {
    return this.authService.handleLoginCallback(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: AuthenticatedUser): Promise<AuthProfileResponseDto> {
    return this.authService.getProfile(user);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  syncProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SyncProfileDto,
  ): Promise<AuthProfileResponseDto> {
    return this.authService.syncProfile(user, dto);
  }

  @Get('session')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current session info' })
  getSession(@CurrentUser() user: AuthenticatedUser): Promise<AuthSessionResponseDto> {
    return this.authService.getSession(user);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record logout' })
  logout(@CurrentUser() user: AuthenticatedUser): Promise<{ message: string }> {
    return this.authService.recordLogout(user);
  }
}
