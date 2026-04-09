import cn from 'classnames';

import { Slot } from '@radix-ui/react-slot';

import S from './Badge.styl';
import { BadgeProps } from './Badge.types';

function Badge({
  className,
  variant = 'default',
  asChild = false,
  squared = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="badge"
      className={cn(
        S.root,
        variant && S[`variant-${variant}`],
        squared && S.squared,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
