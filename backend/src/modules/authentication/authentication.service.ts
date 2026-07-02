import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from '@/database/entities/user-account.entity';
import { Person } from '@/database/entities/person.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { SupabaseService } from '@/shared/services/supabase.service';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { AuditActionType } from '@/shared/types/enums';
import { LoginCallbackDto, StudentLoginDto, SyncProfileDto } from './dto/auth.dto';
import { AuthProfileResponseDto, AuthSessionResponseDto, LoginCallbackResponseDto, StudentLoginResponseDto } from './dto/auth-response.dto';
import { AuthErrors } from './authentication.errors';
import { AuthMapper } from './authentication.mapper';
import { StudentRepository } from '@/modules/student/student.repository';
import { resolveStudentAuthEmail } from '@/shared/utils/student-auth.util';
import { UserRole } from '@/shared/types/enums';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepo: Repository<UserAccount>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    private readonly supabase: SupabaseService,
    private readonly mapper: AuthMapper,
    private readonly studentRepository: StudentRepository,
  ) {}

  async handleLoginCallback(dto: LoginCallbackDto): Promise<LoginCallbackResponseDto> {
    const supabaseUser = await this.supabase.verifyJwt(dto.accessToken);
    if (!supabaseUser) {
      throw DomainException.unauthorized('Invalid access token', AuthErrors.INVALID_TOKEN);
    }

    let userAccount = await this.userAccountRepo.findOne({
      where: { authUserId: supabaseUser.id },
      relations: ['person'],
    });

    if (!userAccount) {
      const person = await this.personRepo.findOne({
        where: { authUserId: supabaseUser.id },
        relations: ['userAccount'],
      });
      userAccount = person?.userAccount ?? null;
    }

    if (!userAccount) {
      throw DomainException.notFound('User account');
    }

    userAccount.lastLogin = new Date();
    await this.userAccountRepo.save(userAccount);

    return {
      profile: this.mapper.toProfileResponse(userAccount, userAccount.person),
      message: 'Login successful',
    };
  }

  async loginWithRegistrationNo(dto: StudentLoginDto): Promise<StudentLoginResponseDto> {
    const student = await this.studentRepository.findByRegistrationNo(dto.registrationNo);
    if (!student?.person) {
      throw DomainException.unauthorized('Invalid registration number or password', AuthErrors.INVALID_CREDENTIALS);
    }

    const authEmail = resolveStudentAuthEmail(student.registrationNo, student.person.email);
    const session = await this.supabase.signInWithPassword(authEmail, dto.password);
    if (!session) {
      throw DomainException.unauthorized('Invalid registration number or password', AuthErrors.INVALID_CREDENTIALS);
    }

    const supabaseUser = await this.supabase.verifyJwt(session.accessToken);
    if (!supabaseUser) {
      throw DomainException.unauthorized('Invalid registration number or password', AuthErrors.INVALID_CREDENTIALS);
    }

    let userAccount = await this.userAccountRepo.findOne({
      where: { authUserId: supabaseUser.id },
      relations: ['person'],
    });

    if (!userAccount) {
      throw DomainException.unauthorized('Student account is not linked', AuthErrors.INVALID_CREDENTIALS);
    }

    if (userAccount.role !== UserRole.Student) {
      throw DomainException.forbidden('This login is for students only', AuthErrors.ACCESS_DENIED);
    }

    userAccount.lastLogin = new Date();
    await this.userAccountRepo.save(userAccount);

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      profile: this.mapper.toProfileResponse(userAccount, userAccount.person),
      message: 'Login successful',
    };
  }

  async getProfile(user: AuthenticatedUser): Promise<AuthProfileResponseDto> {
    const userAccount = await this.userAccountRepo.findOne({
      where: { id: user.userAccountId },
      relations: ['person'],
    });
    if (!userAccount) {
      throw DomainException.notFound('User account', user.userAccountId);
    }
    return this.mapper.toProfileResponse(userAccount, userAccount.person);
  }

  async syncProfile(user: AuthenticatedUser, dto: SyncProfileDto): Promise<AuthProfileResponseDto> {
    const person = await this.personRepo.findOne({ where: { id: user.personId } });
    if (!person) {
      throw DomainException.notFound('Person', user.personId);
    }

    if (dto.email && dto.email !== person.email) {
      const existing = await this.personRepo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== person.id) {
        throw DomainException.conflict('Email already in use', AuthErrors.DUPLICATE_EMAIL);
      }
      person.email = dto.email;
    }

    if (dto.firstName !== undefined) person.firstName = dto.firstName;
    if (dto.lastName !== undefined) person.lastName = dto.lastName;

    await this.personRepo.save(person);

    const userAccount = await this.userAccountRepo.findOne({
      where: { id: user.userAccountId },
      relations: ['person'],
    });
    if (!userAccount) {
      throw DomainException.notFound('User account', user.userAccountId);
    }

    return this.mapper.toProfileResponse(userAccount, person);
  }

  async getSession(user: AuthenticatedUser): Promise<AuthSessionResponseDto> {
    return {
      authenticated: true,
      role: user.role,
      username: user.username,
    };
  }

  async recordLogout(_user: AuthenticatedUser): Promise<{ message: string }> {
    return { message: 'Logout recorded' };
  }

  getAuditActionLogin(): string {
    return AuditActionType.Login;
  }

  getAuditActionLogout(): string {
    return AuditActionType.Logout;
  }
}
