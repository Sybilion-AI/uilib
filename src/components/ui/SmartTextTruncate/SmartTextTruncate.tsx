import cn from 'classnames';
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react';

import S from './SmartTextTruncate.styl';
import type { SmartTextTruncateProps } from './SmartTextTruncate.types';

const ELLIPSIS = ' ... ';
const END_CHARS_COUNT = 10;
const RESIZE_SETTLE_MS = 120;
const GLOBAL_KEY = '__sybilionSmartTextTruncate';
const RESIZE_ROOT_SELECTOR = '[data-smart-text-truncate-resize-root]';
const DRAG_THRESHOLD_PX = 3;

type InteractionStore = {
  isPanelDragging: boolean;
  isResizeRootDragging: boolean;
};

type GlobalState = {
  store: InteractionStore;
  settleTimer: ReturnType<typeof setTimeout> | null;
  resizeRafId: number;
  recalcCallbacks: Set<() => void>;
  resizeRootListenersInit: boolean;
  panelDragActive: boolean;
};

type PendingResizeRootDrag = {
  pointerId: number;
  startX: number;
  startY: number;
};

function getGlobalState(): GlobalState {
  const w = window as Window & { [GLOBAL_KEY]?: GlobalState };
  if (!w[GLOBAL_KEY]) {
    w[GLOBAL_KEY] = {
      store: {
        isPanelDragging: false,
        isResizeRootDragging: false,
      },
      settleTimer: null,
      resizeRafId: 0,
      recalcCallbacks: new Set(),
      resizeRootListenersInit: false,
      panelDragActive: false,
    };
  }
  return w[GLOBAL_KEY];
}

let pendingResizeRootDrag: PendingResizeRootDrag | null = null;

function getIsFastMode(store: InteractionStore) {
  return store.isPanelDragging || store.isResizeRootDragging;
}

function syncFastModeDom(store: InteractionStore) {
  if (typeof document === 'undefined') {
    return;
  }
  if (getIsFastMode(store)) {
    document.documentElement.dataset.smartTextTruncateFast = '';
  } else {
    delete document.documentElement.dataset.smartTextTruncateFast;
  }
}

function clearSettleTimer() {
  const g = getGlobalState();
  if (g.settleTimer) {
    clearTimeout(g.settleTimer);
    g.settleTimer = null;
  }
}

function runSettleRecalc() {
  getGlobalState().recalcCallbacks.forEach(recalc => recalc());
}

function scheduleSettle() {
  const g = getGlobalState();
  clearSettleTimer();

  g.settleTimer = setTimeout(() => {
    g.settleTimer = null;
    runSettleRecalc();
  }, RESIZE_SETTLE_MS);
}

function notifyContainerResize() {
  const g = getGlobalState();
  if (getIsFastMode(g.store)) {
    return;
  }
  scheduleSettle();
}

function beginResizeRootDrag() {
  const g = getGlobalState();
  if (g.store.isResizeRootDragging) {
    return;
  }

  clearSettleTimer();
  g.store = { ...g.store, isResizeRootDragging: true };
  syncFastModeDom(g.store);
}

function endResizeRootDrag() {
  const g = getGlobalState();
  pendingResizeRootDrag = null;

  if (!g.store.isResizeRootDragging) {
    return;
  }

  g.store = { ...g.store, isResizeRootDragging: false };
  syncFastModeDom(g.store);
  scheduleSettle();
}

function onResizeRootPointerDown(e: PointerEvent) {
  if (e.button !== 0) {
    return;
  }

  const root = (e.target as Element | null)?.closest(RESIZE_ROOT_SELECTOR);
  if (!root) {
    return;
  }

  clearSettleTimer();
  pendingResizeRootDrag = {
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
  };
}

function onResizeRootPointerMove(e: PointerEvent) {
  const pending = pendingResizeRootDrag;
  if (!pending || e.pointerId !== pending.pointerId) {
    return;
  }

  const dx = e.clientX - pending.startX;
  const dy = e.clientY - pending.startY;
  if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
    return;
  }

  beginResizeRootDrag();
}

function onResizeRootPointerUp(e: PointerEvent) {
  const pending = pendingResizeRootDrag;
  if (!pending || e.pointerId !== pending.pointerId) {
    return;
  }

  endResizeRootDrag();
}

function ensureResizeRootListeners() {
  const g = getGlobalState();
  if (g.resizeRootListenersInit) {
    return;
  }
  g.resizeRootListenersInit = true;
  window.addEventListener('pointerdown', onResizeRootPointerDown);
  window.addEventListener('pointermove', onResizeRootPointerMove);
  window.addEventListener('pointerup', onResizeRootPointerUp);
  window.addEventListener('pointercancel', onResizeRootPointerUp);
}

function scheduleContainerResize() {
  const g = getGlobalState();
  if (g.resizeRafId !== 0) {
    return;
  }
  g.resizeRafId = requestAnimationFrame(() => {
    g.resizeRafId = 0;
    notifyContainerResize();
  });
}

let sharedResizeObserver: ResizeObserver | null = null;
let widthProbe: Element | null = null;

function observeWidthProbe(container: Element) {
  if (widthProbe) {
    return;
  }

  if (!sharedResizeObserver) {
    sharedResizeObserver = new ResizeObserver(() => {
      const g = getGlobalState();
      if (getIsFastMode(g.store)) {
        return;
      }
      scheduleContainerResize();
    });
  }

  widthProbe = container;
  sharedResizeObserver.observe(container);
}

function unobserveWidthProbe(container: Element) {
  if (widthProbe !== container) {
    return;
  }

  sharedResizeObserver?.unobserve(container);
  widthProbe = null;
}

/** Panel resize handle — call on first pointer move after press, not on pointer down. */
function notifyPanelWidthDragStart() {
  const g = getGlobalState();
  if (g.panelDragActive) {
    return;
  }

  clearSettleTimer();
  g.panelDragActive = true;
  g.store = { ...g.store, isPanelDragging: true };
  syncFastModeDom(g.store);
}

function notifyPanelWidthDragEnd() {
  const g = getGlobalState();
  if (!g.panelDragActive) {
    return;
  }

  g.panelDragActive = false;
  g.store = { ...g.store, isPanelDragging: false };
  syncFastModeDom(g.store);
  scheduleSettle();
}

function computeTruncatedText(
  fullTextEl: HTMLSpanElement,
  text: string,
  containerWidth: number,
): string {
  if (text.length <= END_CHARS_COUNT) {
    return text;
  }

  fullTextEl.textContent = text;
  if (fullTextEl.scrollWidth <= containerWidth) {
    return text;
  }

  const endPart = text.slice(-END_CHARS_COUNT);
  let left = 0;
  let right = text.length - END_CHARS_COUNT;
  let bestStart = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const startPart = text.slice(0, mid);
    const truncated = startPart + ELLIPSIS + endPart;

    fullTextEl.textContent = truncated;
    if (fullTextEl.scrollWidth <= containerWidth) {
      bestStart = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (bestStart === 0) {
    fullTextEl.textContent = ELLIPSIS + endPart;
    if (fullTextEl.scrollWidth <= containerWidth) {
      return ELLIPSIS + endPart;
    }
    return endPart;
  }

  return text.slice(0, bestStart) + ELLIPSIS + endPart;
}

const SmartTextTruncate = memo(function SmartTextTruncate({
  children,
  className,
  ...props
}: SmartTextTruncateProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const fullTextRef = useRef<HTMLSpanElement>(null);
  const lastMeasuredWidthRef = useRef(0);
  const childrenRef = useRef(children);
  childrenRef.current = children;
  const [displayText, setDisplayText] = useState<string>(
    typeof children === 'string' ? children : '',
  );
  const displayTextRef = useRef(displayText);
  displayTextRef.current = displayText;

  const recalc = useCallback(() => {
    if (getIsFastMode(getGlobalState().store)) {
      return;
    }

    const container = containerRef.current;
    const fullText = fullTextRef.current;
    const text = childrenRef.current;

    if (!container || !fullText || typeof text !== 'string') {
      return;
    }

    if (text.length <= END_CHARS_COUNT) {
      if (displayTextRef.current !== text) {
        setDisplayText(text);
      }
      return;
    }

    const containerWidth = container.clientWidth;
    if (containerWidth === 0) {
      return;
    }

    if (
      containerWidth === lastMeasuredWidthRef.current &&
      lastMeasuredWidthRef.current !== 0
    ) {
      return;
    }

    lastMeasuredWidthRef.current = containerWidth;
    const nextText = computeTruncatedText(fullText, text, containerWidth);

    if (nextText !== displayTextRef.current) {
      setDisplayText(nextText);
    }
  }, []);

  useLayoutEffect(() => {
    lastMeasuredWidthRef.current = 0;
    recalc();
  }, [children, recalc]);

  useLayoutEffect(() => {
    ensureResizeRootListeners();
    const g = getGlobalState();
    g.recalcCallbacks.add(recalc);
    return () => {
      g.recalcCallbacks.delete(recalc);
    };
  }, [recalc]);

  useLayoutEffect(() => {
    ensureResizeRootListeners();
    const container = containerRef.current;
    if (!container) {
      return;
    }

    observeWidthProbe(container);

    return () => {
      unobserveWidthProbe(container);
    };
  }, []);

  if (typeof children !== 'string') {
    return (
      <span className={className} {...props}>
        {children}
      </span>
    );
  }

  return (
    <span ref={containerRef} className={cn(S.root, className)} {...props}>
      <span className={S.measuredLabel}>{displayText || children}</span>
      <span className={S.liveLabel}>{children}</span>
      <span ref={fullTextRef} className={S.fullText} aria-hidden="true">
        {children}
      </span>
    </span>
  );
});

export {
  SmartTextTruncate,
  notifyPanelWidthDragStart,
  notifyPanelWidthDragEnd,
};
