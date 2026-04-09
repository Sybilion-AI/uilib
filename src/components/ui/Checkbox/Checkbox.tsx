import cn from 'classnames';

import { CheckIcon } from '@phosphor-icons/react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import S from './Checkbox.styl';
import type { CheckboxProps } from './Checkbox.types';

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(S.checkboxRoot, className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={S.checkboxIndicator}
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
