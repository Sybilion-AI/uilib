import cn from 'classnames';

import S from './LabelWithId.styl';
import type { LabelWithIdProps } from './LabelWithId.types';

export function LabelWithId({ id, label, className }: LabelWithIdProps) {
  return (
    <span data-slot="label-with-id" className={cn(S.root, className)}>
      {String(id) !== '-1' && <div className={S.id}>{id}</div>} {label}
    </span>
  );
}
