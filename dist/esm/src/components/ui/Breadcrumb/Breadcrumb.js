import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { CaretRight, DotsThree } from '@phosphor-icons/react';
import { Slot } from '@radix-ui/react-slot';
import S from './Breadcrumb.styl.js';

function Breadcrumb({ ...props }) {
    return jsx("nav", { "aria-label": "breadcrumb", "data-slot": "breadcrumb", ...props });
}
function BreadcrumbList({ className, ...props }) {
    return (jsx("ol", { "data-slot": "breadcrumb-list", className: cn(S.breadcrumbList, className), ...props }));
}
function BreadcrumbItem({ className, ...props }) {
    return (jsx("li", { "data-slot": "breadcrumb-item", className: cn(S.breadcrumbItem, className), ...props }));
}
function BreadcrumbLink({ asChild, className, ...props }) {
    const Comp = asChild ? Slot : 'a';
    return (jsx(Comp, { "data-slot": "breadcrumb-link", className: cn(S.breadcrumbLink, className), ...props }));
}
function BreadcrumbPage({ className, ...props }) {
    return (jsx("span", { "data-slot": "breadcrumb-page", role: "link", "aria-disabled": "true", "aria-current": "page", className: cn(S.breadcrumbPage, className), ...props }));
}
function BreadcrumbSeparator({ children, className, ...props }) {
    return (jsx("li", { "data-slot": "breadcrumb-separator", role: "presentation", "aria-hidden": "true", className: cn(S.breadcrumbSeparator, className), ...props, children: children ?? jsx(CaretRight, {}) }));
}
function BreadcrumbEllipsis({ className, ...props }) {
    return (jsxs("span", { "data-slot": "breadcrumb-ellipsis", role: "presentation", "aria-hidden": "true", className: cn(S.breadcrumbEllipsis, className), ...props, children: [jsx(DotsThree, { className: "size-4" }), jsx("span", { className: "sr-only", children: "More" })] }));
}

export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };
