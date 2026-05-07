import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { forwardRef } from 'react';
import S from './AppShell.styl.js';

/** Main column in app shell (grid cell + header / body / footer). */
function AppShellMainContent({ className, bodyClassName, children, header, footer, }) {
    return (jsxs("div", { className: cn(S.mainColumn, className), children: [header, jsx("div", { className: cn(S.mainBody, bodyClassName), children: children }), footer] }));
}
const AppShell = forwardRef(function AppShell({ className, ...props }, ref) {
    return jsx("div", { ref: ref, className: cn(S.root, className), ...props });
});

export { AppShell, AppShellMainContent };
