import {
  CHAT_WIDTH_DEFAULT_PX,
  CHAT_WIDTH_MIN_PX,
  CHAT_WIDTH_STORAGE_KEY,
  SIDEBAR_WIDTH_DEFAULT_PX,
  SIDEBAR_WIDTH_MIN_PX,
  SIDEBAR_WIDTH_STORAGE_KEY_PCT,
  SIDEBAR_WIDTH_STORAGE_KEY_PX,
  clampSidebarWidthPx,
  defaultChatWidthPx,
} from '#uilib/hooks/panelWidth';
import { LS } from '@homecode/ui';

export function isEditableKeyboardTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function readInitialSidebarWidthPx(storageKeyPx: string): number {
  if (typeof window === 'undefined') return SIDEBAR_WIDTH_DEFAULT_PX;
  const stored = LS.get(storageKeyPx);
  if (typeof stored === 'number' && stored >= SIDEBAR_WIDTH_MIN_PX) {
    return stored;
  }
  if (storageKeyPx === SIDEBAR_WIDTH_STORAGE_KEY_PX) {
    const legacyPct = LS.get(SIDEBAR_WIDTH_STORAGE_KEY_PCT);
    if (typeof legacyPct === 'number' && legacyPct > 0) {
      const w = window.innerWidth;
      return clampSidebarWidthPx(Math.round((legacyPct / 100) * w), w, {
        chatPanelOpen: false,
        chatWidthPx: 0,
      });
    }
  }
  return SIDEBAR_WIDTH_DEFAULT_PX;
}

export function readInitialChatWidthPx(): number {
  if (typeof window === 'undefined') return CHAT_WIDTH_DEFAULT_PX;
  const stored = LS.get(CHAT_WIDTH_STORAGE_KEY);
  if (typeof stored === 'number' && stored >= CHAT_WIDTH_MIN_PX) {
    return stored;
  }
  return defaultChatWidthPx(window.innerWidth);
}
