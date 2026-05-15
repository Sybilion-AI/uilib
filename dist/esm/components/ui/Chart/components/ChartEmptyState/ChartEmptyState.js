import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './ChartEmptyState.styl.js';

function isNonEmpty(node) {
    if (node == null || node === false)
        return false;
    if (typeof node === 'string')
        return node.trim().length > 0;
    return true;
}
function ChartEmptyState({ className, hint, status, statusTone = 'muted', variant = 'panel', align = 'center', }) {
    const hasHint = isNonEmpty(hint);
    const hasStatus = isNonEmpty(status);
    if (!hasHint && !hasStatus) {
        return null;
    }
    return (jsxs("div", { className: cn(S.root, variant === 'panel' && S.rootPanel, variant === 'inline' && S.rootInline, align === 'start' && S.rootAlignStart, align === 'center' && S.rootAlignCenter, className), children: [hasHint && jsx("div", { className: S.hint, children: hint }), hasStatus && (jsx("div", { className: cn(S.status, statusTone === 'destructive' && S.statusDestructive, statusTone === 'muted' && S.statusMuted), children: status }))] }));
}

export { ChartEmptyState };
