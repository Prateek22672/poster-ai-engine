/**
 * Tiny TTL cache for read-heavy endpoints (gallery, insights).
 * In-memory now (per Node instance) — works on a single server / cPanel Node app.
 * For serverless / multi-instance, swap the get/set bodies for Upstash Redis
 * (same async interface) — nothing else changes.
 */
type Entry = { value: unknown; expires: number };
const store = new Map<string, Entry>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) { store.delete(key); return null; }
  return e.value as T;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

export function cacheInvalidate(prefix: string): void {
  for (const k of Array.from(store.keys())) if (k.startsWith(prefix)) store.delete(k);
}

/** Return the cached value, or run `loader`, cache it, and return it. */
export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await loader();
  await cacheSet(key, value, ttlSeconds);
  return value;
}
