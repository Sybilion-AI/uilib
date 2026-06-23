import { useCallback, useContext, useEffect, useRef } from 'react';

import debounce from '#uilib/tools/debounce';

import { PageContext } from './pageContext';
import { readSavedScrollTop, saveScrollTop } from './pageScrollRestoration';

const SCROLL_SAVE_MS = 150;

/** Session scroll restoration for a PageScroll ancestor (via PageContext). */
export function usePageScrollRestoration(scrollRestorationKey: string) {
  const { getPageScrollElement } = useContext(PageContext);
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);
  const latestScrollTopRef = useRef(0);
  const pendingRestoreTopRef = useRef<number | null>(null);

  const tryRestoreScroll = useCallback(() => {
    const el = getPageScrollElement();
    const top = pendingRestoreTopRef.current;
    if (!el || top == null) return false;

    const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
    const targetTop = Math.min(top, maxTop);
    el.scrollTo({ top: targetTop, behavior: 'auto' });

    const applied = el.scrollTop >= targetTop - 1 || maxTop <= 0;
    if (applied && maxTop > 0) {
      pendingRestoreTopRef.current = null;
    }

    return applied;
  }, [getPageScrollElement]);

  useEffect(() => {
    debouncedSaveRef.current?.cancel();
    debouncedSaveRef.current = debounce(
      (key: string, top: number) => {
        saveScrollTop(key, top);
      },
      SCROLL_SAVE_MS,
      { leading: false },
    );

    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    const el = getPageScrollElement();
    if (!el) return;

    const ro = new ResizeObserver(() => {
      if (pendingRestoreTopRef.current != null) {
        tryRestoreScroll();
      }
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [getPageScrollElement, tryRestoreScroll]);

  useEffect(() => {
    const el = getPageScrollElement();
    if (!el) return;

    latestScrollTopRef.current = el.scrollTop;

    const savedTop = readSavedScrollTop(scrollRestorationKey);
    if (savedTop != null) {
      pendingRestoreTopRef.current = savedTop;
      tryRestoreScroll();
    }

    const handleScroll = () => {
      latestScrollTopRef.current = el.scrollTop;
      debouncedSaveRef.current?.(scrollRestorationKey, el.scrollTop);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', handleScroll);
      debouncedSaveRef.current?.cancel();
      const storedTop = readSavedScrollTop(scrollRestorationKey) ?? 0;
      const top = Math.max(latestScrollTopRef.current, storedTop);
      saveScrollTop(scrollRestorationKey, top);
    };
  }, [getPageScrollElement, scrollRestorationKey, tryRestoreScroll]);
}
