import { PropsWithChildren } from 'react';

import S from './ChatEmptyState.styl';
import type { ChatEmptyStateProps } from './ChatEmptyState.types';
import SparklesIcon from './icons/sparkles.svg';

export function ChatEmptyState({
  icon = <SparklesIcon />,
  title = 'Start a conversation',
  description,
  additionalContent,
  children,
}: PropsWithChildren<ChatEmptyStateProps>) {
  return (
    <div className={S.root}>
      {icon && <div className={S.icon}>{icon}</div>}
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {additionalContent}
      {children}
    </div>
  );
}
