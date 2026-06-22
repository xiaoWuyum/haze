type StorageKey =
  | 'custom_created_spaces'
  | 'saved_play_history'
  | 'saved_space_favorites'
  | 'user_listening_seconds';

export function readJson<T>(key: StorageKey, fallback: T): T {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return fallback;
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: StorageKey, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readNumber(key: StorageKey, fallback = 0): number {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

export function writeNumber(key: StorageKey, value: number) {
  localStorage.setItem(key, String(value));
}

export function removeStoredValue(key: StorageKey) {
  localStorage.removeItem(key);
}
