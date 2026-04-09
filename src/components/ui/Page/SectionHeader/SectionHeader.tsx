import cn from 'classnames';

import S from './SectionHeader.styl';
import type { SectionHeaderProps } from './SectionHeader.types';

export function SectionHeader({
  title,
  description,
  actions,
  className,
  withMargin = false,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(S.root, withMargin && S.withMargin, className)}
      {...props}
    >
      <div className={S.content}>
        <h2 className={S.title}>{title}</h2>
        {description && <p className={S.description}>{description}</p>}
      </div>
      {actions && <div className={S.actions}>{actions}</div>}
    </div>
  );
}
