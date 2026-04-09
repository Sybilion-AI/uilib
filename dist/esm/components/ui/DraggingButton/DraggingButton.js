import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { forwardRef } from 'react';
import S from './DraggingButton.styl.js';

const DraggingButton = forwardRef(({ top = 0, left, className, icon, title, isDragging, size = 'md', ...props }, ref) => {
    return (jsx("button", { ref: ref, className: cn(S.root, S[`size-${size}`], isDragging && S.dragging, className), title: title, style: { top, ...(left && { left }) }, ...props, children: icon }));
});
DraggingButton.displayName = 'DraggingButton';

export { DraggingButton };
