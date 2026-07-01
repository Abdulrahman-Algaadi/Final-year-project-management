import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import * as WebSocket from 'ws';
import { TtlCache, ttlUntilJwtExp } from '@/shared/utils/ttl-cache.util';

const JWT_CACHE_MAX_MS = 5 * 60_000;

const supabaseClientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: {
    transport: WebSocket as unknown as typeof globalThis.WebSocket,
  },
};

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  private readonly adminClient: SupabaseClient;
  private readonly jwtUserCache = new TtlCache<User>(JWT_CACHE_MAX_MS);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const url = this.config.getOrThrow<string>('supabase.url');
    const anonKey = this.config.getOrThrow<string>('supabase.anonKey');
    const serviceKey = this.config.getOrThrow<string>('supabase.serviceRoleKey');

    this.client = createClient(url, anonKey, supabaseClientOptions);
    this.adminClient = createClient(url, serviceKey, supabaseClientOptions);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  getStorageBucket(): string {
    return this.config.get<string>('supabase.storageBucket') ?? 'submissions';
  }

  async verifyJwt(token: string): Promise<User | null> {
    const cached = this.jwtUserCache.get(token);
    if (cached) return cached;

    const ttl = ttlUntilJwtExp(token, JWT_CACHE_MAX_MS, JWT_CACHE_MAX_MS);
    if (ttl <= 0) return null;

    const jwtSecret = this.config.get<string>('supabase.jwtSecret');
    if (jwtSecret) {
      try {
        const payload = this.jwtService.verify<{ sub: string; email?: string }>(token, {
          secret: jwtSecret,
        });
        const user = { id: payload.sub, email: payload.email ?? '' } as User;
        this.jwtUserCache.set(token, user, ttl);
        return user;
      } catch {
        /* fall through to Supabase API */
      }
    }

    const { data, error } = await this.client.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    this.jwtUserCache.set(token, data.user, ttl);
    return data.user;
  }

  async createSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    const bucket = this.getStorageBucket();
    const { data, error } = await this.adminClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      throw error ?? new Error('Failed to create signed URL');
    }
    return data.signedUrl;
  }

  async uploadFile(
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<{ path: string; size: number }> {
    const bucket = this.getStorageBucket();
    const { error } = await this.adminClient.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: false,
    });
    if (error) {
      throw error;
    }
    return { path, size: file.length };
  }
}
