export interface TtlCache<V> {
  get(key: string): V | undefined;
  set(key: string, value: V): void;
  delete(key: string): void;
}

export function createTtlCache<V>({
  ttlMs,
  maxEntries,
}: {
  ttlMs: number;
  maxEntries: number;
}): TtlCache<V> {
  const store = new Map<string, { value: V; expiresAt: number }>();
  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= Date.now()) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value) {
      store.delete(key);
      if (store.size >= maxEntries) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    delete(key) {
      store.delete(key);
    },
  };
}

export function memoizeAsync<V>(
  cache: TtlCache<Promise<V>>,
  key: string,
  load: () => Promise<V>,
): Promise<V> {
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = load().catch((error: unknown) => {
    cache.delete(key); // never cache failures
    throw error;
  });
  cache.set(key, promise);
  return promise;
}
