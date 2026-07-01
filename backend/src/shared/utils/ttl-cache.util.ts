interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Lightweight in-memory TTL cache for hot paths (JWT, reference data). */
export class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly defaultTtlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export function decodeJwtExpMs(token: string): number | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const payload = JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function ttlUntilJwtExp(token: string, fallbackMs: number, maxMs: number): number {
  const expMs = decodeJwtExpMs(token);
  if (!expMs) return fallbackMs;
  const remaining = expMs - Date.now();
  if (remaining <= 0) return 0;
  return Math.min(remaining, maxMs);
}
