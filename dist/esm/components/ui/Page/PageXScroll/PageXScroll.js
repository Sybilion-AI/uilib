import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect } from 'react';
import { Scroll } from '@homecode/ui';
import S from './PageXScroll.styl.js';

const scrollSizeMap = {
    sm: 's',
    md: 'm',
    lg: 'l',
};
function PageXScroll({ children, className, innerClassName, scrollbarClassName, fullWidth = false, size = 'md', ...props }) {
    const [pageXPadding, setPageXPadding] = useState(24); // Default fallback
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const value = getComputedStyle(document.documentElement)
                .getPropertyValue('--page-x-padding')
                .trim();
            if (value) {
                // Convert rem/px to number (assuming px, if rem multiply by 16)
                const numValue = parseFloat(value);
                setPageXPadding(value.includes('rem') ? numValue * 16 : numValue);
            }
        }
    }, []);
    return (jsx(Scroll, { x: true, size: scrollSizeMap[size], fadeSize: "xl", className: cn(className, S.root, fullWidth && S.fullWidth), innerClassName: cn(innerClassName, S.inner), xScrollbarClassName: scrollbarClassName, offset: {
            x: {
                before: pageXPadding,
                after: pageXPadding,
            },
        }, autoHide: true, ...props, children: children }));
}

export { PageXScroll };
