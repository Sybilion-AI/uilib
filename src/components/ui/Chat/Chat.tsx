import cn from 'classnames';

import { ChatPresets } from '@/components/ui/Chat/ChatPresets';

import S from './Chat.styl';
import type { ChatProps } from './Chat.types';
import { ChatEmptyState } from './ChatEmptyState/ChatEmptyState';
import { ChatMessage } from './ChatMessage';
import { ChatPrompt } from './ChatPrompt';

export function Chat({ children, className, isEmpty, ...props }: ChatProps) {
  return (
    <div className={cn(S.root, className, isEmpty && S.isEmpty)} {...props}>
      {children}
    </div>
  );
}

Chat.Prompt = ChatPrompt;
Chat.Message = ChatMessage;
Chat.Presets = ChatPresets;
Chat.EmptyState = ChatEmptyState;
