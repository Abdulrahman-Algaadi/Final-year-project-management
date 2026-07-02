import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '@/database/entities/student.entity';
import { Person } from '@/database/entities/person.entity';
import { UserAccount } from '@/database/entities/user-account.entity';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentAccountService } from './student-account.service';
import { StudentRepository, StudentPersonRepository } from './student.repository';
import { StudentMapper } from './student.mapper';
import { StudentPolicy } from './student.policy';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Person, UserAccount]), AdvisorModule],
  controllers: [StudentController],
  providers: [
    StudentService,
    StudentAccountService,
    StudentRepository,
    StudentPersonRepository,
    StudentMapper,
    StudentPolicy,
  ],
  exports: [StudentService, StudentRepository, StudentAccountService],
})
export class StudentModule {}
