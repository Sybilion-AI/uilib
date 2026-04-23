import S from './ChatEmptyState.styl';
import type { ChatEmptyStateProps } from './ChatEmptyState.types';

export function ChatEmptyState({
  icon,
  title,
  description,
}: ChatEmptyStateProps) {
  return (
    <div className={S.root}>
      {icon && <div className={S.icon}>{icon}</div>}
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
    </div>
  );
}
