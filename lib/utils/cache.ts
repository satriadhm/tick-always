export class SimpleCache<T> {
  private cache: Map<string, { value: T; expiresAt: number }>;
  private defaultTtl: number;

  constructor(defaultTtlSeconds: number = 300) {
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  set(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl;
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
