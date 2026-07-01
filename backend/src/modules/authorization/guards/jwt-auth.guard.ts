import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from '@/database/entities/user-account.entity';
import { Person } from '@/database/entities/person.entity';
import { IS_PUBLIC_KEY } from '@/shared/decorators/auth.decorators';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { AuthenticatedUser } from '@/shared/types/common.types';
import { SupabaseService } from '@/shared/services/supabase.service';
import { TtlCache, ttlUntilJwtExp } from '@/shared/utils/ttl-cache.util';

const AUTH_CONTEXT_MAX_MS = 5 * 60_000;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly authContextCache = new TtlCache<AuthenticatedUser>(AUTH_CONTEXT_MAX_MS);

  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
    @InjectRepository(UserAccount)
    private readonly userAccountRepo: Repository<UserAccount>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      headers: { authorization?: string };
    }>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw DomainException.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const cacheTtl = ttlUntilJwtExp(token, AUTH_CONTEXT_MAX_MS, AUTH_CONTEXT_MAX_MS);
    if (cacheTtl <= 0) {
      throw DomainException.unauthorized('Invalid or expired token');
    }

    const cachedUser = this.authContextCache.get(token);
    if (cachedUser) {
      request.user = cachedUser;
      return true;
    }

    const supabaseUser = await this.supabase.verifyJwt(token);
    if (!supabaseUser) {
      throw DomainException.unauthorized('Invalid or expired token');
    }

    let userAccount: UserAccount | null = await this.userAccountRepo.findOne({
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
      throw DomainException.unauthorized('User account not found');
    }

    const person =
      userAccount.person ?? (await this.personRepo.findOne({ where: { id: userAccount.personId } }));

    const authenticatedUser: AuthenticatedUser = {
      authUserId: supabaseUser.id,
      userAccountId: userAccount.id,
      personId: userAccount.personId,
      role: userAccount.role,
      email: person?.email ?? supabaseUser.email ?? '',
      username: userAccount.username,
    };

    this.authContextCache.set(token, authenticatedUser, cacheTtl);
    request.user = authenticatedUser;

    return true;
  }
}
