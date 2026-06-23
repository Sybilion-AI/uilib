import { isBrowser } from '#uilib/tools/env';

export function readSavedScrollTop(key: string): number | null {
  if (!isBrowser) return null;

  const raw = sessionStorage.getItem(key);
  if (raw == null) return null;

  const top = Number(raw);
  return Number.isFinite(top) && top > 0 ? top : null;
}

export function saveScrollTop(key: string, top: number): void {
  if (!isBrowser) return;

  if (top <= 0) {
    sessionStorage.removeItem(key);
    return;
  }

  sessionStorage.setItem(key, String(top));
}
