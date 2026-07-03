import { Fragment, type ReactNode, createElement } from 'react';

/** Minimal stand-in for @homecode/ui Theme root: renders children only. */
function Theme({ children }: { children?: ReactNode }) {
  return createElement(Fragment, null, children);
}

/** Minimal stand-in for @homecode/ui Shimmer placeholder. */
function Shimmer({ className }: { className?: string }) {
  return createElement('div', { className });
}

const ThemeDefaults = {
  colors: { dark: '#000000', light: '#ffffff' },
  getColors(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...overrides };
  },
  getConfig(): Record<string, unknown> {
    return {};
  },
};

const ThemeHelpers = {
  colorsConfigToVars(_config: Record<string, unknown>): Record<string, string> {
    return {};
  },
};

/** Minimal stand-in for @homecode/ui Scroll: a plain div wrapper. */
function Scroll({
  children,
  className,
  onInnerRef,
}: {
  children?: ReactNode;
  className?: string;
  onInnerRef?: (el: HTMLDivElement | null) => void;
}) {
  return createElement('div', { className, ref: onInnerRef }, children);
}

const NotificationsStore = {
  items: [] as string[],
  autoHide: [] as string[],
  data: {} as Record<string, unknown>,
  paused: false,
  show(_data: Record<string, unknown>) {
    return 'mock-notification-id';
  },
  close(_id: string) {},
  remove(_id: string) {},
  pause() {},
  unpause() {},
};

const LS = {
  get(key: string) {
    const raw = window.localStorage.getItem(key);
    if (!raw) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },
  set(key: string, val: unknown) {
    if (val === undefined || val === null) {
      window.localStorage.removeItem(key);
      return;
    }
    const item = typeof val === 'object' ? JSON.stringify(val) : String(val);
    window.localStorage.setItem(key, item);
  },
  remove(key: string) {
    window.localStorage.removeItem(key);
  },
};

export {
  LS,
  NotificationsStore,
  Scroll,
  Shimmer,
  Theme,
  ThemeDefaults,
  ThemeHelpers,
};
