import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '@/database/entities/department.entity';
import { BaseRepository } from '@/shared/repositories/base.repository';

@Injectable()
export class DepartmentRepository extends BaseRepository<Department> {
  constructor(@InjectRepository(Department) repository: Repository<Department>) {
    super(repository);
  }

  async findByCode(code: string): Promise<Department | null> {
    return this.repository.findOne({ where: { code } });
  }
}
