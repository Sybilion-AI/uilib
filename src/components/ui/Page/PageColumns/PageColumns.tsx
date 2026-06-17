import cn from 'classnames';

import S from './PageColumns.styl';

type PageColumnsProps = {
  /** Column content nodes. Pass 2–4 siblings for equal splits; 2 only for main+aside. */
  columns: React.ReactNode[];
  /**
   * Column growth mode. Omit for 2–4 equal columns (default).
   * `left` / `right` are for **2-column** main+aside only (fixed 360px sidebar).
   */
  fill?: 'left' | 'right';
  className?: string;
};

export function PageColumns({ columns, fill, className }: PageColumnsProps) {
  return (
    <div className={cn(S.root, S[`fill-${fill || 'all'}`], className)}>
      {columns.map((column, index) => (
        <div className={cn(S.column)} key={index}>
          {column}
        </div>
      ))}
    </div>
  );
}
