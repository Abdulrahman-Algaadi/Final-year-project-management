import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Advisor } from '@/database/entities/advisor.entity';
import { Person } from '@/database/entities/person.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { PaginationMeta, QueryOptions } from '@/shared/types/common.types';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { UpdateAdvisorDto } from './dto/update-advisor.dto';
import { AdvisorResponseDto } from './dto/advisor-response.dto';
import { AdvisorRepository, AdvisorPersonRepository } from './advisor.repository';
import { AdvisorMapper } from './advisor.mapper';
import { AdvisorErrors } from './advisor.errors';
import { AdvisorAccountService } from './advisor-account.service';

@Injectable()
export class AdvisorService {
  constructor(
    private readonly repository: AdvisorRepository,
    private readonly personRepository: AdvisorPersonRepository,
    private readonly mapper: AdvisorMapper,
    private readonly dataSource: DataSource,
    private readonly advisorAccountService: AdvisorAccountService,
  ) {}

  async findAll(options: QueryOptions): Promise<{ items: AdvisorResponseDto[]; meta: PaginationMeta }> {
    const { items, meta } = await this.repository.findAll(options, 'advisor', [], ['person']);
    return { items: this.mapper.toResponseList(items), meta };
  }

  async findById(id: number): Promise<AdvisorResponseDto> {
    const entity = await this.repository.findByIdWithPerson(id);
    if (!entity) {
      throw DomainException.notFound('Advisor', id);
    }
    return this.mapper.toResponse(entity);
  }

  private async assertUniqueEmail(email?: string, excludePersonId?: number): Promise<void> {
    if (!email) return;
    const existing = await this.personRepository.findByEmail(email);
    if (existing && existing.id !== excludePersonId) {
      throw DomainException.conflict('Email already in use', AdvisorErrors.DUPLICATE_EMAIL);
    }
  }

  async create(dto: CreateAdvisorDto): Promise<AdvisorResponseDto> {
    await this.assertUniqueEmail(dto.email);

    const response = await this.dataSource.transaction(async (manager) => {
      const person = manager.create(Person, {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        email: dto.email?.trim(),
        genderId: dto.genderId,
        dateOfBirth: dto.dateOfBirth,
        contactNo: dto.contactNo,
        createdAt: new Date(),
      });
      const savedPerson = await manager.save(Person, person);

      const advisor = manager.create(Advisor, {
        id: savedPerson.id,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        salary: dto.salary,
      });
      const savedAdvisor = await manager.save(Advisor, advisor);
      savedAdvisor.person = savedPerson;
      return this.mapper.toResponse(savedAdvisor, savedPerson);
    });

    await this.advisorAccountService.provisionLogin(
      response.id,
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
    );

    return response;
  }

  async update(id: number, dto: UpdateAdvisorDto): Promise<AdvisorResponseDto> {
    const entity = await this.repository.findByIdWithPerson(id);
    if (!entity) {
      throw DomainException.notFound('Advisor', id);
    }

    await this.assertUniqueEmail(dto.email, entity.id);

    if (dto.firstName !== undefined) entity.person.firstName = dto.firstName?.trim();
    if (dto.lastName !== undefined) entity.person.lastName = dto.lastName?.trim();
    if (dto.email !== undefined) entity.person.email = dto.email?.trim();
    if (dto.genderId !== undefined) entity.person.genderId = dto.genderId;
    if (dto.dateOfBirth !== undefined) entity.person.dateOfBirth = dto.dateOfBirth;
    if (dto.contactNo !== undefined) entity.person.contactNo = dto.contactNo;
    if (dto.departmentId !== undefined) entity.departmentId = dto.departmentId;
    if (dto.designationId !== undefined) entity.designationId = dto.designationId;
    if (dto.salary !== undefined) entity.salary = dto.salary;

    await this.personRepository.save(entity.person);
    const saved = await this.repository.save(entity);

    if (dto.password) {
      await this.advisorAccountService.updatePassword(entity.id, dto.password);
    }

    return this.mapper.toResponse(saved, entity.person);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw DomainException.notFound('Advisor', id);
    }
    await this.repository.softDelete(id);
  }
}
