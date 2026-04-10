import type { ReactNode } from 'react';

import S from './PageEmptyCanvas.styl';

export function PageEmptyCanvas({
  title,
  hint,
  children,
}: {
  title?: string;
  hint?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={S.root}>
      <p className={S.title}>{title}</p>
      <p className={S.hint}>{hint}</p>
      {children}
    </div>
  );
}
