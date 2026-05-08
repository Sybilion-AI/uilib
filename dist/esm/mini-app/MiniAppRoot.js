import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { createContext, useContext, useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Theme, Scroll } from '@homecode/ui';
import S from './MiniAppRoot.styl.js';
import { resolveParentOriginFromReferrer, applyThemeToDocument, buildReadyMessage, parseThemeSyncMessage } from './miniAppProtocol.js';
import { getDefaultMiniAppThemeConfig } from './miniAppThemeConfig.js';

const defaultTheme = {
    mode: 'light',
    isDarkMode: false,
};
function isEmbeddedMiniApp() {
    return typeof window !== 'undefined' && window.parent !== window;
}
function themeFromDocument() {
    if (typeof document === 'undefined')
        return defaultTheme;
    const isDark = document.documentElement.classList.contains('dark');
    return {
        mode: isDark ? 'dark' : 'light',
        isDarkMode: isDark,
    };
}
const MiniAppShellContext = createContext(null);
function useMiniAppShellTheme() {
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
function isTrustedParentMessage(event) {
    // Ignore messages from other windows (e.g. popups, other iframes).
    if (event.source !== window.parent)
        return false;
    const fromReferrer = resolveParentOriginFromReferrer();
    // Tighten to embedder origin when the browser exposes it.
    if (fromReferrer && event.origin !== fromReferrer)
        return false;
    return true;
}
function MiniAppRoot({ children, className, appId, onThemeChange, getThemeConfig, }) {
    const [theme, setTheme] = useState(() => isEmbeddedMiniApp() ? defaultTheme : themeFromDocument());
    const onThemeChangeRef = useRef(onThemeChange);
    onThemeChangeRef.current = onThemeChange;
    const getThemeConfigRef = useRef(getThemeConfig ?? getDefaultMiniAppThemeConfig);
    getThemeConfigRef.current = getThemeConfig ?? getDefaultMiniAppThemeConfig;
    const currThemeConfig = useMemo(() => getThemeConfigRef.current(theme.isDarkMode), [theme.isDarkMode]);
    const sendReady = useCallback(() => {
        if (!window.parent || window.parent === window)
            return;
        const payload = appId ? { appId } : {};
        const msg = buildReadyMessage(payload);
        const target = resolveParentOriginFromReferrer();
        if (target) {
            window.parent.postMessage(msg, target);
        }
        else {
            window.parent.postMessage(msg, '*');
        }
    }, [appId]);
    useEffect(() => {
        if (!isEmbeddedMiniApp())
            return;
        applyThemeToDocument(theme.mode);
    }, [theme.mode]);
    useEffect(() => {
        const onMessage = (event) => {
            if (!isTrustedParentMessage(event))
                return;
            const parsed = parseThemeSyncMessage(event.data);
            if (!parsed)
                return;
            setTheme(parsed);
            onThemeChangeRef.current?.(parsed);
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);
    useEffect(() => {
        sendReady();
        if (document.readyState === 'complete')
            return;
        window.addEventListener('load', sendReady);
        return () => window.removeEventListener('load', sendReady);
    }, [sendReady]);
    const ctx = useMemo(() => ({ theme }), [theme]);
    return (jsxs(MiniAppShellContext.Provider, { value: ctx, children: [jsx(Theme, { config: currThemeConfig }), jsx(Scroll, { y: true, fadeSize: "l", className: cn(S.root, className), innerClassName: S.inner, offset: { y: { before: 50, after: 50 } }, autoHide: true, children: children })] }));
}

export { MiniAppRoot, useMiniAppShellTheme };
