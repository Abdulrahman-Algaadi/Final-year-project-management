import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ENTITIES } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('database.url');
        const ssl = config.get<boolean>('database.ssl');
        const usePooler = config.get<boolean>('database.pooler');
        const sslConfig = ssl ? { rejectUnauthorized: false } : false;

        // Supabase Shared Pooler (port 6543) requires disabling prepared statements.
        const poolerExtra = usePooler
          ? {
              max: 10,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 10000,
              statement_timeout: 60000,
              statement_cache_size: 0,
            }
          : { max: 10 };

        const baseOptions = {
          type: 'postgres' as const,
          entities: ENTITIES,
          synchronize: false,
          logging: false,
          ssl: sslConfig,
          extra: poolerExtra,
        };

        if (databaseUrl) {
          return {
            ...baseOptions,
            url: databaseUrl,
          };
        }

        return {
          ...baseOptions,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),
        };
      },
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
