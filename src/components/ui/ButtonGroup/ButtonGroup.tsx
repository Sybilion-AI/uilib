import cn from 'classnames';

import S from './ButtonGroup.styl';
import type { ButtonGroupProps } from './ButtonGroup.types';

function ButtonGroup({ className, ...props }: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      className={cn(S.root, className)}
      role="group"
      {...props}
    />
  );
}

export { ButtonGroup };
