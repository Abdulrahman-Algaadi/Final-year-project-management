import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from '@/database/entities/department.entity';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { SemesterRepository } from './semester.repository';
import { SemesterMapper } from './semester.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Semester])],
  controllers: [SemesterController],
  providers: [SemesterService, SemesterRepository, SemesterMapper],
  exports: [SemesterService, SemesterRepository],
})
export class SemesterModule {}
