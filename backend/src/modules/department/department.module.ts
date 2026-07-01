import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '@/database/entities/department.entity';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './department.repository';
import { DepartmentMapper } from './department.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentRepository, DepartmentMapper],
  exports: [DepartmentService, DepartmentRepository],
})
export class DepartmentModule {}
