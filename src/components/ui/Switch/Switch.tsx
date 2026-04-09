'use client';

import cn from 'classnames';

import * as SwitchPrimitive from '@radix-ui/react-switch';

import S from './Switch.styl';
import type { SwitchProps } from './Switch.types';

function Switch({
  className,
  checked,
  onCheckedChange,
  size = 'md',
  ...props
}: SwitchProps) {
  const handleCheckedChange = (checkedValue: boolean) => {
    // Radix Switch always returns boolean, ensure we pass it correctly
    onCheckedChange?.(checkedValue);
  };

  // Ensure checked is always a boolean (never undefined/null/indeterminate)
  // Default to false if undefined/null to ensure controlled component behavior
  // const checkedValue = checked === true || checked === false ? checked : false;

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(S.switchRoot, S[`size-${size}`], className)}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={S.switchThumb}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
