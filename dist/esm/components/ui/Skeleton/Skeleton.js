import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './Skeleton.styl.js';

function Skeleton({ className, size = 'md', shape = 'rectangle', ...props }) {
    return (jsx("div", { "data-slot": "skeleton", className: cn(S.root, S[`size-${size}`], S[`shape-${shape}`], className), ...props }));
}

export { Skeleton };
