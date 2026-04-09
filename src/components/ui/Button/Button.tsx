import cn from 'classnames';

import { Slot } from '@radix-ui/react-slot';

import S from './Button.styl';
import type { ButtonProps } from './Button.types';

const sizeClass = (s: 'sm' | 'md' | 'lg') =>
  s === 'sm' ? S.sizeSm : s === 'md' ? S.sizeMd : S.sizeLg;

function Button({
  className,
  variant = 'default',
  size = 'md',
  icon = false,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(
        S.root,
        S[variant],
        icon ? S.sizeIcon : sizeClass(size),
        className,
      )}
      {...props}
    />
  );
}

export { Button };
