import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from '@/shared/decorators/auth.decorators';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { Permission } from '@/shared/types/enums';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { AuthorizationService } from '../authorization.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) {
      throw DomainException.unauthorized();
    }

    const hasPermission = this.authorizationService.hasAnyPermission(user.role, requiredPermissions);
    if (!hasPermission) {
      throw DomainException.forbidden('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
    }

    return true;
  }
}
