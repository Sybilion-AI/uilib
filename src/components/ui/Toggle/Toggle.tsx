'use client';

import cn from 'classnames';

import * as TogglePrimitive from '@radix-ui/react-toggle';

import S from './Toggle.styl';
import { ToggleProps } from './Toggle.types';

function Toggle({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(
        S.toggle,
        S[`variant-${variant}`],
        S[`size-${size}`],
        className,
      )}
      {...props}
    />
  );
}

export { Toggle };
