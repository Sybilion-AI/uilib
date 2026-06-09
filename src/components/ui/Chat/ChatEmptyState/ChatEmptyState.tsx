import type { ChatEmptyStateProps } from './ChatEmptyState.types';
import { PropsWithChildren } from 'react';
import S from './ChatEmptyState.styl';
import SparklesIcon from './icons/sparkles.svg';
import cn from 'classnames';

export function ChatEmptyState({
  icon = <SparklesIcon />,
  title = 'Start a conversation',
  description,
  additionalContent,
  children,
  className,
}: PropsWithChildren<ChatEmptyStateProps>) {
  return (
    <div className={cn(S.root, className)}>
      {icon && <div className={S.icon}>{icon}</div>}
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {additionalContent}
      {children}
    </div>
  );
}
