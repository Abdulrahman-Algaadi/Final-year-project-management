import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccount } from '@/database/entities/user-account.entity';
import { Person } from '@/database/entities/person.entity';
import { AuthorizationService } from './authorization.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserAccount, Person])],
  providers: [AuthorizationService, JwtAuthGuard, PermissionsGuard, RolesGuard],
  exports: [AuthorizationService, JwtAuthGuard, PermissionsGuard, RolesGuard],
})
export class AuthorizationModule {}
