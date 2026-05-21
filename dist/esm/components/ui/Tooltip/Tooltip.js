import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { createContext, useRef, useMemo, useContext, useCallback, useLayoutEffect } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import S from './Tooltip.styl.js';

const TooltipContext = createContext(null);
function composeRefs(...refs) {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') {
                ref(node);
            }
            else if (ref) {
                ref.current = node;
            }
        }
    };
}
function getPopperWrapper(contentEl) {
    const wrapper = contentEl.parentElement;
    if (!wrapper?.hasAttribute('data-radix-popper-content-wrapper'))
        return null;
    return wrapper;
}
const OVER_TRIGGER_OFFSET = { left: -10, top: -6 };
function applyOverTriggerStyles(contentEl, triggerEl) {
    const wrapper = getPopperWrapper(contentEl);
    if (!wrapper)
        return;
    const rect = triggerEl.getBoundingClientRect();
    const computed = window.getComputedStyle(triggerEl);
    wrapper.style.setProperty('position', 'fixed', 'important');
    wrapper.style.setProperty('left', `${rect.left + OVER_TRIGGER_OFFSET.left}px`, 'important');
    wrapper.style.setProperty('top', `${rect.top + OVER_TRIGGER_OFFSET.top}px`, 'important');
    wrapper.style.setProperty('transform', 'none', 'important');
    wrapper.style.setProperty('min-width', '0', 'important');
    wrapper.style.setProperty('width', `${rect.width}px`, 'important');
    contentEl.style.width = '100%';
    contentEl.style.boxSizing = 'border-box';
    contentEl.style.fontSize = computed.fontSize;
    contentEl.style.lineHeight = computed.lineHeight;
}
function clearOverTriggerStyles(contentEl) {
    if (!contentEl)
        return;
    const wrapper = getPopperWrapper(contentEl);
    if (!wrapper)
        return;
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
function TooltipProvider({ delayDuration = 0, ...props }) {
    return (jsx(TooltipPrimitive.Provider, { "data-slot": "tooltip-provider", delayDuration: delayDuration, ...props }));
}
function Tooltip({ children, ...props }) {
    const triggerRef = useRef(null);
    const contextValue = useMemo(() => ({ triggerRef }), []);
    return (jsx(TooltipProvider, { children: jsx(TooltipContext.Provider, { value: contextValue, children: jsx(TooltipPrimitive.Root, { "data-slot": "tooltip", ...props, children: children }) }) }));
}
function TooltipTrigger({ ref, ...props }) {
    const context = useContext(TooltipContext);
    return (jsx(TooltipPrimitive.Trigger, { ref: context ? composeRefs(context.triggerRef, ref) : ref, "data-slot": "tooltip-trigger", ...props }));
}
function TooltipContent({ className, sideOffset = 0, children, maxWidth, overTrigger = false, align, side, avoidCollisions, style: styleProp, ...props }) {
    const context = useContext(TooltipContext);
    const contentRef = useRef(null);
    const updateOverTriggerPosition = useCallback(() => {
        const triggerEl = context?.triggerRef.current;
        const contentEl = contentRef.current;
        if (!overTrigger || !triggerEl || !contentEl)
            return;
        applyOverTriggerStyles(contentEl, triggerEl);
    }, [context, overTrigger]);
    useLayoutEffect(() => {
        if (!overTrigger)
            return;
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
    if (maxWidth)
        style.maxWidth = `${maxWidth}px`;
    return (jsx(TooltipPrimitive.Portal, { children: jsxs(TooltipPrimitive.Content, { ref: contentRef, "data-slot": "tooltip-content", side: overTrigger ? 'bottom' : side, align: overTrigger ? 'start' : align, sideOffset: overTrigger ? 0 : sideOffset, avoidCollisions: overTrigger ? false : avoidCollisions, className: cn(S.tooltipContent, overTrigger && S.tooltipContentOverTrigger, className), ...props, style: style, children: [children, !overTrigger && jsx(TooltipPrimitive.Arrow, { className: S.tooltipArrow })] }) }));
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
