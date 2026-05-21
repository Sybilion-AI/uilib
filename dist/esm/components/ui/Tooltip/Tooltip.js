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
const TRIGGER_TEXT_STYLE_PROPS = [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'font-variant',
    'font-stretch',
    'line-height',
    'letter-spacing',
    'word-spacing',
    'text-transform',
    'text-indent',
    'text-decoration-line',
    'text-decoration-color',
    'text-decoration-style',
    'text-decoration-thickness',
    'text-underline-offset',
    'font-feature-settings',
    'font-variation-settings',
    'font-kerning',
    'font-optical-sizing',
    'font-synthesis',
    'font-variant-numeric',
    'font-variant-ligatures',
    'font-variant-caps',
    'font-variant-east-asian',
    'tab-size',
    'color',
    'word-break',
    'overflow-wrap',
    'hyphens',
];
function applyTriggerTextStyles(contentEl, computed) {
    for (const prop of TRIGGER_TEXT_STYLE_PROPS) {
        contentEl.style.setProperty(prop, computed.getPropertyValue(prop));
    }
}
function clearTriggerTextStyles(contentEl) {
    for (const prop of TRIGGER_TEXT_STYLE_PROPS) {
        contentEl.style.removeProperty(prop);
    }
}
function parsePx(value) {
    return Number.parseFloat(value) || 0;
}
function applyOverTriggerStyles(contentEl, triggerEl) {
    const wrapper = getPopperWrapper(contentEl);
    if (!wrapper)
        return;
    const rect = triggerEl.getBoundingClientRect();
    const triggerComputed = window.getComputedStyle(triggerEl);
    const contentComputed = window.getComputedStyle(contentEl);
    const paddingLeft = parsePx(contentComputed.paddingLeft);
    const paddingRight = parsePx(contentComputed.paddingRight);
    const paddingTop = parsePx(contentComputed.paddingTop);
    const borderLeft = parsePx(contentComputed.borderLeftWidth);
    const borderRight = parsePx(contentComputed.borderRightWidth);
    const borderTop = parsePx(contentComputed.borderTopWidth);
    wrapper.style.setProperty('position', 'fixed', 'important');
    wrapper.style.setProperty('left', `${rect.left - paddingLeft - borderLeft}px`, 'important');
    wrapper.style.setProperty('top', `${rect.top - paddingTop - borderTop}px`, 'important');
    wrapper.style.setProperty('transform', 'none', 'important');
    wrapper.style.setProperty('min-width', '0', 'important');
    wrapper.style.setProperty('width', `${rect.width + paddingLeft + paddingRight + borderLeft + borderRight}px`, 'important');
    contentEl.style.width = '100%';
    contentEl.style.boxSizing = 'border-box';
    applyTriggerTextStyles(contentEl, triggerComputed);
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
    clearTriggerTextStyles(contentEl);
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
