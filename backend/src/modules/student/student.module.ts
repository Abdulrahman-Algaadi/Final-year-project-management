import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '@/database/entities/student.entity';
import { Person } from '@/database/entities/person.entity';
import { AdvisorModule } from '@/modules/advisor/advisor.module';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentRepository, StudentPersonRepository } from './student.repository';
import { StudentMapper } from './student.mapper';
import { StudentPolicy } from './student.policy';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Person]), AdvisorModule],
  controllers: [StudentController],
  providers: [
    StudentService,
    StudentRepository,
    StudentPersonRepository,
    StudentMapper,
    StudentPolicy,
  ],
  exports: [StudentService, StudentRepository],
})
export class StudentModule {}
