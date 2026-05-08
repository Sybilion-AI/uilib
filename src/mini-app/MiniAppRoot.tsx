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

import { Scroll, Theme } from '@homecode/ui';

import S from './MiniAppRoot.styl';
import {
  type ThemeSyncPayload,
  applyThemeToDocument,
  buildReadyMessage,
  isTrustedMiniAppParentMessage,
  parseThemeSyncMessage,
  resolveParentOriginFromReferrer,
} from './miniAppProtocol';
import {
  type MiniAppThemeConfig,
  getDefaultMiniAppThemeConfig,
} from './miniAppThemeConfig';

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

export type MiniAppRootProps = {
  children: ReactNode;
  className?: string;
  /** Included in READY payload when set. */
  appId?: string;
  onThemeChange?: (theme: ThemeSyncPayload) => void;
  /** Overrides `@homecode/ui` `<Theme config>` builder (defaults to generic mini-app palette). */
  getThemeConfig?: (isDarkMode: boolean) => MiniAppThemeConfig;
};

export function MiniAppRoot({
  children,
  className,
  appId,
  onThemeChange,
  getThemeConfig,
}: MiniAppRootProps): React.ReactElement {
  const [theme, setTheme] = useState<ThemeSyncPayload>(() =>
    isEmbeddedMiniApp() ? defaultTheme : themeFromDocument(),
  );
  const onThemeChangeRef = useRef(onThemeChange);
  onThemeChangeRef.current = onThemeChange;

  const getThemeConfigRef = useRef(
    getThemeConfig ?? getDefaultMiniAppThemeConfig,
  );
  getThemeConfigRef.current = getThemeConfig ?? getDefaultMiniAppThemeConfig;

  const currThemeConfig = useMemo(
    () => getThemeConfigRef.current(theme.isDarkMode),
    [theme.isDarkMode],
  );

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
      if (!isTrustedMiniAppParentMessage(event)) return;
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
      <Theme config={currThemeConfig} />
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
