import cn from 'classnames';

import S from './Kicker.styl';
import { KickerProps } from './Kicker.types';

function Kicker({ className, dash = false, children, ...props }: KickerProps) {
  return (
    <div data-slot="kicker" className={cn(S.root, className)} {...props}>
      {dash && <span aria-hidden="true">{'\u2014 '}</span>}
      {children}
    </div>
  );
}

export { Kicker };
