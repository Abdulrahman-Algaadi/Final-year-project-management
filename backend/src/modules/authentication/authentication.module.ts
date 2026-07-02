import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccount } from '@/database/entities/user-account.entity';
import { Person } from '@/database/entities/person.entity';
import { StudentModule } from '@/modules/student/student.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AuthMapper } from './authentication.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccount, Person]), StudentModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthMapper],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
