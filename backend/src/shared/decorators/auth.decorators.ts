import { SetMetadata } from '@nestjs/common';
import { Permission } from '../types/enums';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
