import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './GridLayout.styl.js';

function GridLayout({ children, colWidth = 300, gap = 'var(--p-2)', className, as: asProp, }) {
    const As = asProp ?? 'div';
    return (jsx(As, { className: cn(S.root, className), style: {
            maxWidth: '100%',
            gap: gap,
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${colWidth}px, 1fr))`,
        }, children: children }));
}

export { GridLayout };
