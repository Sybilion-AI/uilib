'use client';

import cn from 'classnames';
import { type ComponentRef, forwardRef } from 'react';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import S from './Progress.styl';
import type { ProgressProps } from './Progress.types';

const Progress = forwardRef<
  ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(S.root, className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={S.indicator}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
