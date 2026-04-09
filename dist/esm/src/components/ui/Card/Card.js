import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useEffect } from 'react';
import { TextWithDeferTooltip } from '../TextWithDeferTooltip/TextWithDeferTooltip.js';
import { Scroll } from '@homecode/ui';
import S from './Card.styl.js';

const SCROLL_OFFSET = 300;
function Card({ className, paddingSize = 'm', ...props }) {
    return (jsx("div", { className: cn(S.root, S[`padding-${paddingSize}`], className), ...props }));
}
function LinkCard({ className, ...props }) {
    return (jsx("a", { target: "_blank", rel: "noopener noreferrer", "data-slot": "link-card", className: cn(S.root, className), ...props }));
}
function CardHeader({ className, icon, iconWithBackground = false, textsClassName, title, titleClassName, description, descriptionClassName, children, tooltipProps, ...props }) {
    return (jsxs("div", { "data-slot": "card-header", className: cn(S.header, className), ...props, children: [icon && (jsx("div", { className: cn(S.icon, iconWithBackground && S.withBackground), children: icon })), children, (title || description) && (jsxs("div", { className: cn(S.headerText, textsClassName), children: [title && (jsx(CardTitle, { className: titleClassName, ...tooltipProps, children: title })), description && (jsx(CardDescription, { className: descriptionClassName, ...tooltipProps, children: description }))] }))] }));
}
function CardTitle({ className, ...props }) {
    return (jsx(TextWithDeferTooltip, { maxWidth: 400, "data-slot": "card-title", className: cn(S.title, className), ...props }));
}
function CardDescription({ className, ...props }) {
    return (jsx(TextWithDeferTooltip, { maxWidth: 400, "data-slot": "card-description", className: cn(S.description, className), ...props }));
}
function CardAction({ className, ...props }) {
    return (jsx("div", { "data-slot": "card-action", className: cn(S.action, className), ...props }));
}
function CardContent({ className, centered, fullHeight, noScroll, children, autoScrollBottom, ...props }) {
    const contentRef = useRef(null);
    const contentDiv = (jsx("div", { "data-slot": "card-content", className: cn(className, centered && S.centered, fullHeight && S.fullHeight), ...props, children: children }));
    useEffect(() => {
        if (!noScroll && autoScrollBottom) {
            const inner = contentRef.current?.firstChild;
            if (!inner)
                return;
            if (inner.scrollHeight > SCROLL_OFFSET) {
                inner.scrollTo({
                    top: inner?.scrollHeight - inner.offsetHeight - SCROLL_OFFSET,
                    behavior: 'instant',
                });
            }
            setTimeout(() => {
                const top = inner.scrollHeight + 1000;
                inner.scrollTo({ top, behavior: 'smooth' });
            }, 0);
        }
    }, [noScroll, autoScrollBottom]);
    if (noScroll)
        return contentDiv;
    return (
    // @ts-ignore
    jsx(Scroll, { y: true, autoHide: true, fadeSize: "m", className: S.scroll, ref: contentRef, children: contentDiv }));
}
function CardFooter({ className, ...props }) {
    return (jsx("div", { "data-slot": "card-footer", className: cn(S.footer, className), ...props }));
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, LinkCard };
