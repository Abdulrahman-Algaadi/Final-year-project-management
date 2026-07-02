import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '@/database/entities/person.entity';
import { UserAccount } from '@/database/entities/user-account.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { SupabaseService } from '@/shared/services/supabase.service';
import { UserRole } from '@/shared/types/enums';
import {
  defaultStudentUsername,
  resolveStudentAuthEmail,
} from '@/shared/utils/student-auth.util';

@Injectable()
export class StudentAccountService {
  constructor(
    private readonly supabase: SupabaseService,
    @InjectRepository(UserAccount)
    private readonly userAccountRepo: Repository<UserAccount>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async provisionLogin(
    personId: number,
    registrationNo: string,
    password: string,
    contactEmail?: string | null,
    firstName?: string | null,
    lastName?: string | null,
  ): Promise<void> {
    const authEmail = resolveStudentAuthEmail(registrationNo, contactEmail);
    const username = defaultStudentUsername(registrationNo);

    const existingAccount = await this.userAccountRepo.findOne({ where: { personId } });
    if (existingAccount?.authUserId) {
      await this.supabase.updateAuthUserPassword(existingAccount.authUserId, password);
      return;
    }

    const authUserId = await this.supabase.ensureAuthUser(authEmail, password);

    await this.personRepo.update(personId, {
      authUserId,
      email: contactEmail?.trim() || authEmail,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
    });

    if (existingAccount) {
      existingAccount.authUserId = authUserId;
      existingAccount.username = username;
      existingAccount.role = UserRole.Student;
      await this.userAccountRepo.save(existingAccount);
      return;
    }

    const account = this.userAccountRepo.create({
      personId,
      username,
      role: UserRole.Student,
      authUserId,
    });
    await this.userAccountRepo.save(account);
  }

  async updatePassword(personId: number, password: string): Promise<void> {
    const account = await this.userAccountRepo.findOne({ where: { personId } });
    if (!account?.authUserId) {
      throw DomainException.notFound('Student login account');
    }
    await this.supabase.updateAuthUserPassword(account.authUserId, password);
  }
}
