import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { forwardRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import S from './Progress.styl.js';

const Progress = forwardRef(({ className, value, ...props }, ref) => (jsx(ProgressPrimitive.Root, { ref: ref, className: cn(S.root, className), ...props, children: jsx(ProgressPrimitive.Indicator, { className: S.indicator, style: { transform: `translateX(-${100 - (value || 0)}%)` } }) })));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
