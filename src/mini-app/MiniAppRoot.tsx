import cn from 'classnames';
import type { ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Scroll } from '@homecode/ui';

import S from './MiniAppRoot.styl';
import {
  type ThemeSyncPayload,
  applyThemeToDocument,
  buildReadyMessage,
  parseThemeSyncMessage,
  resolveParentOriginFromReferrer,
} from './miniAppProtocol';

const defaultTheme: ThemeSyncPayload = {
  mode: 'light',
  isDarkMode: false,
};

function isEmbeddedMiniApp(): boolean {
  return typeof window !== 'undefined' && window.parent !== window;
}

function themeFromDocument(): ThemeSyncPayload {
  if (typeof document === 'undefined') return defaultTheme;
  const isDark = document.documentElement.classList.contains('dark');
  return {
    mode: isDark ? 'dark' : 'light',
    isDarkMode: isDark,
  };
}

export type MiniAppShellContextValue = {
  theme: ThemeSyncPayload;
};

const MiniAppShellContext = createContext<MiniAppShellContextValue | null>(
  null,
);

export function useMiniAppShellTheme(): MiniAppShellContextValue {
  const v = useContext(MiniAppShellContext);
  if (!v) {
    throw new Error('useMiniAppShellTheme must be used within MiniAppRoot');
  }
  return v;
}

/**
 * Accept only messages that appear to come from the real embedding parent:
 * - `source` must be `window.parent` (same as shell’s iframe target).
 * - When `document.referrer` is present, `origin` must match it (Sybilion page that loaded this iframe).
 *   If referrer was stripped (Referrer-Policy), we only rely on `source` matching `parent`.
 */
function isTrustedParentMessage(event: MessageEvent): boolean {
  // Ignore messages from other windows (e.g. popups, other iframes).
  if (event.source !== window.parent) return false;
  const fromReferrer = resolveParentOriginFromReferrer();
  // Tighten to embedder origin when the browser exposes it.
  if (fromReferrer && event.origin !== fromReferrer) return false;
  return true;
}

export type MiniAppRootProps = {
  children: ReactNode;
  className?: string;
  /** Included in READY payload when set. */
  appId?: string;
  onThemeChange?: (theme: ThemeSyncPayload) => void;
};

export function MiniAppRoot({
  children,
  className,
  appId,
  onThemeChange,
}: MiniAppRootProps): React.ReactElement {
  const [theme, setTheme] = useState<ThemeSyncPayload>(() =>
    isEmbeddedMiniApp() ? defaultTheme : themeFromDocument(),
  );
  const onThemeChangeRef = useRef(onThemeChange);
  onThemeChangeRef.current = onThemeChange;

  const sendReady = useCallback(() => {
    if (!window.parent || window.parent === window) return;
    const payload = appId ? { appId } : {};
    const msg = buildReadyMessage(payload);
    const target = resolveParentOriginFromReferrer();

    if (target) {
      window.parent.postMessage(msg, target);
    } else {
      window.parent.postMessage(msg, '*');
    }
  }, [appId]);

  useEffect(() => {
    if (!isEmbeddedMiniApp()) return;
    applyThemeToDocument(theme.mode);
  }, [theme.mode]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isTrustedParentMessage(event)) return;
      const parsed = parseThemeSyncMessage(event.data);
      if (!parsed) return;
      setTheme(parsed);
      onThemeChangeRef.current?.(parsed);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    sendReady();
    if (document.readyState === 'complete') return;
    window.addEventListener('load', sendReady);
    return () => window.removeEventListener('load', sendReady);
  }, [sendReady]);

  const ctx = useMemo((): MiniAppShellContextValue => ({ theme }), [theme]);

  return (
    <MiniAppShellContext.Provider value={ctx}>
      <Scroll
        y
        fadeSize="l"
        className={cn(S.root, className)}
        innerClassName={S.inner}
        offset={{ y: { before: 50, after: 50 } }}
        autoHide
      >
        {children}
      </Scroll>
    </MiniAppShellContext.Provider>
  );
}
