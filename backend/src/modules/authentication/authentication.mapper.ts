import { UserAccount } from '@/database/entities/user-account.entity';
import { Person } from '@/database/entities/person.entity';
import { Injectable } from '@nestjs/common';
import { AuthProfileResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthMapper {
  toProfileResponse(userAccount: UserAccount, person?: Person | null): AuthProfileResponseDto {
    return {
      userAccountId: userAccount.id,
      personId: userAccount.personId,
      username: userAccount.username,
      role: userAccount.role,
      email: person?.email,
      firstName: person?.firstName,
      lastName: person?.lastName,
      lastLogin: userAccount.lastLogin,
    };
  }
}
