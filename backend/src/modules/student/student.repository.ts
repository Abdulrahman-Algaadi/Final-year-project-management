import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '@/database/entities/student.entity';
import { Person } from '@/database/entities/person.entity';
import { QueryOptions, PaginationMeta } from '@/shared/types/common.types';
import { BaseRepository } from '@/shared/repositories/base.repository';
import { applySoftDeleteFilter } from '@/shared/utils/query.util';
import { paginateQuery } from '@/shared/utils/repository.util';

@Injectable()
export class StudentRepository extends BaseRepository<Student> {
  constructor(@InjectRepository(Student) repository: Repository<Student>) {
    super(repository);
  }

  async findByIdWithPerson(id: number): Promise<Student | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['person', 'department', 'semester'],
    });
  }

  async findByRegistrationNo(registrationNo: string): Promise<Student | null> {
    return this.repository.findOne({ where: { registrationNo } });
  }

  async findByPersonId(personId: number): Promise<Student | null> {
    return this.repository.findOne({ where: { id: personId }, relations: ['person'] });
  }

  async findAllForAdvisor(
    advisorId: number,
    options: QueryOptions,
  ): Promise<{ items: Student[]; meta: PaginationMeta }> {
    const qb = this.repository
      .createQueryBuilder('student')
      .distinct(true)
      .innerJoin('group_student', 'gs', 'gs.student_id = student.id')
      .innerJoin('group_project', 'gp', 'gp.group_id = gs.group_id')
      .innerJoin('project_advisor', 'pa', 'pa.project_id = gp.project_id')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('student.department', 'department')
      .leftJoinAndSelect('student.semester', 'semester')
      .where('pa.advisor_id = :advisorId', { advisorId });

    applySoftDeleteFilter(qb, 'student', options.includeDeleted);

    if (options.search) {
      qb.andWhere(
        '(student.registration_no ILIKE :search OR person.first_name ILIKE :search OR person.last_name ILIKE :search OR person.email ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    return paginateQuery(
      qb,
      'student',
      { ...options, sortBy: options.sortBy ?? 'registrationNo' },
      'registrationNo',
    );
  }

  async isStudentAccessibleByAdvisor(advisorId: number, studentId: number): Promise<boolean> {
    const count = await this.repository.manager
      .createQueryBuilder()
      .select('1')
      .from('group_student', 'gs')
      .innerJoin('group_project', 'gp', 'gp.group_id = gs.group_id')
      .innerJoin('project_advisor', 'pa', 'pa.project_id = gp.project_id')
      .where('pa.advisor_id = :advisorId', { advisorId })
      .andWhere('gs.student_id = :studentId', { studentId })
      .getCount();
    return count > 0;
  }
}

@Injectable()
export class StudentPersonRepository {
  constructor(@InjectRepository(Person) private readonly repository: Repository<Person>) {}

  create(data: Partial<Person>): Person {
    return this.repository.create(data);
  }

  async save(entity: Person): Promise<Person> {
    return this.repository.save(entity);
  }

  async findByEmail(email: string): Promise<Person | null> {
    return this.repository.findOne({ where: { email } });
  }
}
