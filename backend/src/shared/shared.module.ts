import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseService } from './services/supabase.service';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [SupabaseService],
  exports: [SupabaseService, JwtModule],
})
export class SharedModule {}
