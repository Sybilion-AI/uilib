import { jsx } from 'react/jsx-runtime';
import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Scroll } from '@homecode/ui';
import { resolveParentOriginFromReferrer, applyThemeToDocument, buildReadyMessage, parseThemeSyncMessage } from './miniAppProtocol.js';
import S from './MiniAppRoot.styl.js';

const defaultTheme = {
    mode: 'light',
    isDarkMode: false,
};
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
function MiniAppRoot({ children, appId, onThemeChange, }) {
    const [theme, setTheme] = useState(defaultTheme);
    const onThemeChangeRef = useRef(onThemeChange);
    onThemeChangeRef.current = onThemeChange;
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
    return (jsx(MiniAppShellContext.Provider, { value: ctx, children: jsx(Scroll, { y: true, fadeSize: "l", className: S.root, children: children }) }));
}

export { MiniAppRoot, useMiniAppShellTheme };
