import type { NoticeStore } from '@/types/notice';

export const STORAGE_KEY = 'bid-analyzer-store';
export const MAX_BYTES = 5 * 1024 * 1024;

export function loadStore(): NoticeStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { notices: [] };
    return JSON.parse(raw) as NoticeStore;
  } catch {
    return { notices: [] };
  }
}

export function saveStore(store: NoticeStore): { overLimit: boolean } {
  const serialized = JSON.stringify(store);
  const overLimit = new Blob([serialized]).size > MAX_BYTES;
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // storage full
  }
  return { overLimit };
}
