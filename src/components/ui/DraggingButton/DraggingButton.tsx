import cn from 'classnames';
import React, { ReactNode, forwardRef } from 'react';

import S from './DraggingButton.styl';

interface DraggingButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'style' | 'title' | 'className'
  > {
  top?: string;
  left?: string;
  className?: string;
  icon: ReactNode;
  title: string;
  isDragging: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DraggingButton = forwardRef<
  HTMLButtonElement,
  DraggingButtonProps
>(
  (
    { top = 0, left, className, icon, title, isDragging, size = 'md', ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          S.root,
          S[`size-${size}`],
          isDragging && S.dragging,
          className,
        )}
        title={title}
        style={{ top, ...(left && { left }) }}
        {...props}
      >
        {icon}
      </button>
    );
  },
);

DraggingButton.displayName = 'DraggingButton';
