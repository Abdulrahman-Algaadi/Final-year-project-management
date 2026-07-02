import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '@/database/entities/person.entity';
import { UserAccount } from '@/database/entities/user-account.entity';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { SupabaseService } from '@/shared/services/supabase.service';
import { UserRole } from '@/shared/types/enums';
import { defaultAdvisorUsername } from '@/shared/utils/advisor-auth.util';

@Injectable()
export class AdvisorAccountService {
  constructor(
    private readonly supabase: SupabaseService,
    @InjectRepository(UserAccount)
    private readonly userAccountRepo: Repository<UserAccount>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async provisionLogin(
    personId: number,
    email: string,
    password: string,
    firstName?: string | null,
    lastName?: string | null,
  ): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const username = defaultAdvisorUsername(normalizedEmail);

    const existingAccount = await this.userAccountRepo.findOne({ where: { personId } });
    if (existingAccount?.authUserId) {
      await this.supabase.updateAuthUserPassword(existingAccount.authUserId, password);
      return;
    }

    const authUserId = await this.supabase.ensureAuthUser(normalizedEmail, password);

    const personUpdate: Partial<Person> = {
      authUserId,
      email: normalizedEmail,
    };
    if (firstName?.trim()) personUpdate.firstName = firstName.trim();
    if (lastName?.trim()) personUpdate.lastName = lastName.trim();
    await this.personRepo.update(personId, personUpdate);

    if (existingAccount) {
      existingAccount.authUserId = authUserId;
      existingAccount.username = username;
      existingAccount.role = UserRole.Advisor;
      await this.userAccountRepo.save(existingAccount);
      return;
    }

    const account = this.userAccountRepo.create({
      personId,
      username,
      role: UserRole.Advisor,
      authUserId,
    });
    await this.userAccountRepo.save(account);
  }

  async updatePassword(personId: number, password: string): Promise<void> {
    const account = await this.userAccountRepo.findOne({ where: { personId } });
    if (!account?.authUserId) {
      throw DomainException.notFound('Advisor login account');
    }
    await this.supabase.updateAuthUserPassword(account.authUserId, password);
  }
}
