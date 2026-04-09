import cn from 'classnames';

import S from './PageColumns.styl';

export function PageColumns({
  columns,
  fill = 'all',
  className,
}: {
  columns: React.ReactNode[];
  fill: 'left' | 'right' | 'all';
  className?: string;
}) {
  return (
    <div
      className={cn(
        S.root,
        fill === 'left' && S.fillLeft,
        fill === 'right' && S.fillRight,
        fill === 'all' && S.fillAll,
        className,
      )}
    >
      {columns.map((column, index) => (
        <div className={cn(S.column)} key={index}>
          {column}
        </div>
      ))}
    </div>
  );
}
