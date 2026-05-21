import cn from 'classnames';
import {
  type Ref,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import S from './Tooltip.styl';
import type {
  TooltipContentProps,
  TooltipProps,
  TooltipProviderProps,
  TooltipTriggerProps,
} from './Tooltip.types';

type TooltipContextValue = {
  triggerRef: React.RefObject<HTMLElement | null>;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

function composeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }
  };
}

function getPopperWrapper(contentEl: HTMLElement): HTMLElement | null {
  const wrapper = contentEl.parentElement;
  if (!wrapper?.hasAttribute('data-radix-popper-content-wrapper')) return null;

  return wrapper;
}

const OVER_TRIGGER_OFFSET = { left: -10, top: -6 };

function applyOverTriggerStyles(
  contentEl: HTMLElement,
  triggerEl: HTMLElement,
) {
  const wrapper = getPopperWrapper(contentEl);
  if (!wrapper) return;

  const rect = triggerEl.getBoundingClientRect();
  const computed = window.getComputedStyle(triggerEl);

  wrapper.style.setProperty('position', 'fixed', 'important');
  wrapper.style.setProperty(
    'left',
    `${rect.left + OVER_TRIGGER_OFFSET.left}px`,
    'important',
  );
  wrapper.style.setProperty(
    'top',
    `${rect.top + OVER_TRIGGER_OFFSET.top}px`,
    'important',
  );
  wrapper.style.setProperty('transform', 'none', 'important');
  wrapper.style.setProperty('min-width', '0', 'important');
  wrapper.style.setProperty('width', `${rect.width}px`, 'important');

  contentEl.style.width = '100%';
  contentEl.style.boxSizing = 'border-box';
  contentEl.style.fontSize = computed.fontSize;
  contentEl.style.lineHeight = computed.lineHeight;
}

function clearOverTriggerStyles(contentEl: HTMLElement | null) {
  if (!contentEl) return;

  const wrapper = getPopperWrapper(contentEl);
  if (!wrapper) return;

  wrapper.style.removeProperty('position');
  wrapper.style.removeProperty('left');
  wrapper.style.removeProperty('top');
  wrapper.style.removeProperty('transform');
  wrapper.style.removeProperty('min-width');
  wrapper.style.removeProperty('width');

  contentEl.style.removeProperty('width');
  contentEl.style.removeProperty('box-sizing');
  contentEl.style.removeProperty('font-size');
  contentEl.style.removeProperty('line-height');
}

function TooltipProvider({
  delayDuration = 0,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ children, ...props }: TooltipProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const contextValue = useMemo(() => ({ triggerRef }), []);

  return (
    <TooltipProvider>
      <TooltipContext.Provider value={contextValue}>
        <TooltipPrimitive.Root data-slot="tooltip" {...props}>
          {children}
        </TooltipPrimitive.Root>
      </TooltipContext.Provider>
    </TooltipProvider>
  );
}

function TooltipTrigger({ ref, ...props }: TooltipTriggerProps) {
  const context = useContext(TooltipContext);

  return (
    <TooltipPrimitive.Trigger
      ref={context ? composeRefs(context.triggerRef, ref) : ref}
      data-slot="tooltip-trigger"
      {...props}
    />
  );
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  maxWidth,
  overTrigger = false,
  align,
  side,
  avoidCollisions,
  style: styleProp,
  ...props
}: TooltipContentProps) {
  const context = useContext(TooltipContext);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const updateOverTriggerPosition = useCallback(() => {
    const triggerEl = context?.triggerRef.current;
    const contentEl = contentRef.current;
    if (!overTrigger || !triggerEl || !contentEl) return;

    applyOverTriggerStyles(contentEl, triggerEl);
  }, [context, overTrigger]);

  useLayoutEffect(() => {
    if (!overTrigger) return;

    let frameId = 0;

    const tick = () => {
      updateOverTriggerPosition();
      frameId = requestAnimationFrame(tick);
    };

    tick();

    window.addEventListener('scroll', updateOverTriggerPosition, true);
    window.addEventListener('resize', updateOverTriggerPosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateOverTriggerPosition, true);
      window.removeEventListener('resize', updateOverTriggerPosition);
      clearOverTriggerStyles(contentRef.current);
    };
  }, [overTrigger, updateOverTriggerPosition]);

  const style = { ...styleProp };
  if (maxWidth) style.maxWidth = `${maxWidth}px`;

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={contentRef}
        data-slot="tooltip-content"
        side={overTrigger ? 'bottom' : side}
        align={overTrigger ? 'start' : align}
        sideOffset={overTrigger ? 0 : sideOffset}
        avoidCollisions={overTrigger ? false : avoidCollisions}
        className={cn(
          S.tooltipContent,
          overTrigger && S.tooltipContentOverTrigger,
          className,
        )}
        {...props}
        style={style}
      >
        {children}
        {!overTrigger && <TooltipPrimitive.Arrow className={S.tooltipArrow} />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
