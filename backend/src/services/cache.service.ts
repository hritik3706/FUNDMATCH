const store = new Map<string, { value: unknown; expiresAt: number }>();

const MATCH_TTL_MS = 60 * 60 * 1000;
const ACTION_PLAN_TTL_MS = 4 * 60 * 60 * 1000;

export function matchCacheKey(profileId: string, schemeId: string, contextHash = ""): string {
  return `matches:${profileId}:${schemeId}:${contextHash}`;
}

export function actionPlanCacheKey(profileId: string, schemeId: string): string {
  return `actionplan:${profileId}:${schemeId}`;
}

export const CACHE_TTL = {
  matchMs: MATCH_TTL_MS,
  actionPlanMs: ACTION_PLAN_TTL_MS,
};

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheHas(key: string): boolean {
  return cacheGet(key) !== null;
}
