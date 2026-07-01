import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from './authorization.service';
import { Permission, UserRole } from '@/shared/types/enums';

describe('AuthorizationService', () => {
  let service: AuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationService],
    }).compile();

    service = module.get(AuthorizationService);
  });

  it('should grant admin all permissions', () => {
    expect(service.hasPermission(UserRole.Admin, Permission.DepartmentCreate)).toBe(true);
  });

  it('should restrict student permissions', () => {
    expect(service.hasPermission(UserRole.Student, Permission.DepartmentCreate)).toBe(false);
    expect(service.hasPermission(UserRole.Student, Permission.StudentReadOwn)).toBe(true);
  });
});
