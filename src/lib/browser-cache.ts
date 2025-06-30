export function getCachedItem<T>(key: string, ttl: number): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp < ttl) {
      return data as T;
    }
    localStorage.removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
  return null;
}

export function setCachedItem<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = { timestamp: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore write errors
  }
}
