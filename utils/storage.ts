// utils/storage.ts
// Utility functions for localStorage-based data persistence

export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
}
