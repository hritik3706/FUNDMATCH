const memory = new Map<string, string>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = canUseStorage() ? window.localStorage.getItem(key) : memory.get(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  if (canUseStorage()) window.localStorage.setItem(key, raw);
  else memory.set(key, raw);
}
