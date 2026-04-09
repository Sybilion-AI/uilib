import cn from 'classnames';

import * as SeparatorPrimitive from '@radix-ui/react-separator';

import S from './Separator.styl';
import type { SeparatorProps } from './Separator.types';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(S.root, className)}
      {...props}
    />
  );
}

export { Separator };
