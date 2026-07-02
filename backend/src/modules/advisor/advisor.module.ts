import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advisor } from '@/database/entities/advisor.entity';
import { Person } from '@/database/entities/person.entity';
import { UserAccount } from '@/database/entities/user-account.entity';
import { AdvisorController } from './advisor.controller';
import { AdvisorService } from './advisor.service';
import { AdvisorAccountService } from './advisor-account.service';
import { AdvisorRepository, AdvisorPersonRepository } from './advisor.repository';
import { AdvisorMapper } from './advisor.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Advisor, Person, UserAccount])],
  controllers: [AdvisorController],
  providers: [
    AdvisorService,
    AdvisorAccountService,
    AdvisorRepository,
    AdvisorPersonRepository,
    AdvisorMapper,
  ],
  exports: [AdvisorService, AdvisorRepository],
})
export class AdvisorModule {}
