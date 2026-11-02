import cn from 'classnames';

import S from './LabelWithId.styl';
import type { LabelWithIdProps } from './LabelWithId.types';

/** Negative ids are history lines (-1 is the single "Historical"): no id badge. */
const showsId = (id: string | number) =>
  typeof id === 'number' ? id >= 0 : id !== '-1';

export function LabelWithId({ id, label, className }: LabelWithIdProps) {
  return (
    <span data-slot="label-with-id" className={cn(S.root, className)}>
      {showsId(id) && <div className={S.id}>{id}</div>}
      <span className={S.label} data-analysis-id={id}>
        {label}
      </span>
    </span>
  );
}
