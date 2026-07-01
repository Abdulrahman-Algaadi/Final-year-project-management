import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccount } from '@/database/entities/user-account.entity';
import { Person } from '@/database/entities/person.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AuthMapper } from './authentication.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccount, Person])],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthMapper],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
