import { Injectable } from '@nestjs/common';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@/shared/types/enums';

@Injectable()
export class AuthorizationService {
  getPermissionsForRole(role: UserRole | string): Permission[] {
    return ROLE_PERMISSIONS[role as UserRole] ?? [];
  }

  hasPermission(role: UserRole | string, permission: Permission): boolean {
    return this.getPermissionsForRole(role).includes(permission);
  }

  hasAnyPermission(role: UserRole | string, permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(role, p));
  }

  hasAllPermissions(role: UserRole | string, permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(role, p));
  }
}
