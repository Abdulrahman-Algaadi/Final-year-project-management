import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Student } from '@/database/entities/student.entity';
import { Person } from '@/database/entities/person.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { UserRole } from '@/shared/types/enums';
import { AuthenticatedUser, PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { AdvisorRepository } from '@/modules/advisor/advisor.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { StudentRepository, StudentPersonRepository } from './student.repository';
import { StudentMapper } from './student.mapper';
import { StudentPolicy } from './student.policy';
import { StudentErrors } from './student.errors';
import { StudentAccountService } from './student-account.service';

@Injectable()
export class StudentService {
  constructor(
    private readonly repository: StudentRepository,
    private readonly personRepository: StudentPersonRepository,
    private readonly mapper: StudentMapper,
    private readonly policy: StudentPolicy,
    private readonly dataSource: DataSource,
    private readonly advisorRepository: AdvisorRepository,
    private readonly studentAccountService: StudentAccountService,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: StudentResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(
      { ...options, sortBy: options.sortBy ?? 'registrationNo' },
      'student',
      ['registrationNo'],
      ['person'],
    );
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findAllForUser(
    user: AuthenticatedUser,
    options: QueryOptions,
  ): Promise<{ items: StudentResponseDto[]; meta: PaginationMeta }> {
    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const { items, meta } = await this.repository.findAllForAdvisor(advisor.id, options);
      return { items: this.mapper.toResponseList(items), meta };
    }

    return this.findAll(options);
  }

  async findById(id: number): Promise<StudentResponseDto> {
    const entity = await this.repository.findByIdWithPerson(id);
    if (!entity) {
      throw DomainException.notFound('Student', id);
    }
    return this.mapper.toResponse(entity);
  }

  async findByIdForUser(user: AuthenticatedUser, id: number): Promise<StudentResponseDto> {
    if (user.role === UserRole.Student && user.personId !== id) {
      throw DomainException.forbidden('You do not have access to this student', StudentErrors.ACCESS_DENIED);
    }

    if (user.role === UserRole.Advisor) {
      const advisor = await this.advisorRepository.findById(user.personId);
      if (!advisor) {
        throw DomainException.notFound('Advisor', user.personId);
      }
      const canAccess = await this.repository.isStudentAccessibleByAdvisor(advisor.id, id);
      if (!canAccess) {
        throw DomainException.forbidden('You do not have access to this student', StudentErrors.ACCESS_DENIED);
      }
    }

    return this.findById(id);
  }

  async findOwn(user: AuthenticatedUser): Promise<StudentResponseDto> {
    const entity = await this.repository.findByPersonId(user.personId);
    if (!entity) {
      throw DomainException.notFound('Student', user.personId);
    }
    return this.mapper.toResponse(entity);
  }

  private async assertUniqueEmail(email?: string, excludePersonId?: number): Promise<void> {
    if (!email) return;
    const existing = await this.personRepository.findByEmail(email);
    if (existing && existing.id !== excludePersonId) {
      throw DomainException.conflict('Email already in use', StudentErrors.DUPLICATE_EMAIL);
    }
  }

  async create(dto: CreateStudentDto): Promise<StudentResponseDto> {
    const existingReg = await this.repository.findByRegistrationNo(dto.registrationNo.trim());
    if (existingReg) {
      throw DomainException.conflict('Registration number already exists', StudentErrors.DUPLICATE_REGISTRATION);
    }
    await this.assertUniqueEmail(dto.email);

    const response = await this.dataSource.transaction(async (manager) => {
      const person = manager.create(Person, {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        email: dto.email?.trim(),
        genderId: dto.genderId,
        dateOfBirth: dto.dateOfBirth,
        contactNo: dto.contactNo,
        address: dto.address,
        createdAt: new Date(),
      });
      const savedPerson = await manager.save(Person, person);

      const student = manager.create(Student, {
        id: savedPerson.id,
        registrationNo: dto.registrationNo.trim(),
        departmentId: dto.departmentId,
        semesterId: dto.semesterId,
        enrollmentYear: dto.enrollmentYear,
      });
      const savedStudent = await manager.save(Student, student);
      savedStudent.person = savedPerson;
      return this.mapper.toResponse(savedStudent, savedPerson);
    });

    await this.studentAccountService.provisionLogin(
      response.id,
      dto.registrationNo.trim(),
      dto.password,
      dto.email,
      dto.firstName,
      dto.lastName,
    );

    return response;
  }

  async update(id: number, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const entity = await this.repository.findByIdWithPerson(id);
    if (!entity) {
      throw DomainException.notFound('Student', id);
    }

    this.policy.assertRegistrationImmutable(
      (dto as CreateStudentDto).registrationNo,
      entity.registrationNo,
    );

    await this.assertUniqueEmail(dto.email, entity.id);

    if (dto.firstName !== undefined) entity.person.firstName = dto.firstName?.trim();
    if (dto.lastName !== undefined) entity.person.lastName = dto.lastName?.trim();
    if (dto.email !== undefined) entity.person.email = dto.email?.trim();
    if (dto.genderId !== undefined) entity.person.genderId = dto.genderId;
    if (dto.dateOfBirth !== undefined) entity.person.dateOfBirth = dto.dateOfBirth;
    if (dto.contactNo !== undefined) entity.person.contactNo = dto.contactNo;
    if (dto.address !== undefined) entity.person.address = dto.address;
    if (dto.departmentId !== undefined) entity.departmentId = dto.departmentId;
    if (dto.semesterId !== undefined) entity.semesterId = dto.semesterId;
    if (dto.enrollmentYear !== undefined) entity.enrollmentYear = dto.enrollmentYear;

    await this.personRepository.save(entity.person);
    const saved = await this.repository.save(entity);

    if (dto.password) {
      await this.studentAccountService.updatePassword(entity.id, dto.password);
    }

    return this.mapper.toResponse(saved, entity.person);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Student', id);
    }
    await this.repository.softDelete(id);
  }
}
