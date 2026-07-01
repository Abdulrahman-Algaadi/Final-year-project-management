import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisor } from '@/database/entities/advisor.entity';
import { Person } from '@/database/entities/person.entity';
import { BaseRepository } from '@/shared/repositories/base.repository';

@Injectable()
export class AdvisorRepository extends BaseRepository<Advisor> {
  constructor(@InjectRepository(Advisor) repository: Repository<Advisor>) {
    super(repository);
  }

  async findByIdWithPerson(id: number): Promise<Advisor | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['person', 'department', 'designation'],
    });
  }
}

@Injectable()
export class AdvisorPersonRepository {
  constructor(@InjectRepository(Person) private readonly repository: Repository<Person>) {}

  async findByEmail(email: string): Promise<Person | null> {
    return this.repository.findOne({ where: { email } });
  }

  async save(entity: Person): Promise<Person> {
    return this.repository.save(entity);
  }
}
