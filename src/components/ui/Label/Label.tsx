import cn from 'classnames';

import * as LabelPrimitive from '@radix-ui/react-label';

import S from './Label.styl';
import type { LabelProps } from './Label.types';

function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(S.root, className)}
      {...props}
    />
  );
}

export { Label };
