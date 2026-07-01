import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from '@/database/entities/department.entity';
import { BaseRepository } from '@/shared/repositories/base.repository';

@Injectable()
export class SemesterRepository extends BaseRepository<Semester> {
  constructor(@InjectRepository(Semester) repository: Repository<Semester>) {
    super(repository);
  }
}
