import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lookup } from '@/database/entities/department.entity';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';
import { LookupRepository } from './lookup.repository';
import { LookupMapper } from './lookup.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Lookup])],
  controllers: [LookupController],
  providers: [LookupService, LookupRepository, LookupMapper],
  exports: [LookupService, LookupRepository],
})
export class LookupModule {}
