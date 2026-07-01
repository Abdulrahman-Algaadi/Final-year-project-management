import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAccount } from '@/database/entities/user-account.entity';
import { Person } from '@/database/entities/person.entity';
import { SupabaseService } from '@/shared/services/supabase.service';
import { AuthenticationService } from './authentication.service';
import { AuthMapper } from './authentication.mapper';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        AuthMapper,
        { provide: getRepositoryToken(UserAccount), useValue: { findOne: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(Person), useValue: { findOne: jest.fn(), save: jest.fn() } },
        { provide: SupabaseService, useValue: { verifyJwt: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
