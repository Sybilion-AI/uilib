import cn from 'classnames';

import { ChatPresets } from '#uilib/components/ui/Chat/ChatPresets';

import S from './Chat.styl';
import type { ChatProps } from './Chat.types';
import { ChatEmptyState } from './ChatEmptyState/ChatEmptyState';
import { ChatMessage } from './ChatMessage';
import { ChatPrompt } from './ChatPrompt';
import { ChatSelector } from './ChatSheet/ChatSelector';

export function Chat({
  children,
  className,
  isEmpty,
  scopeId,
  onChatDeleted,
  onNewChat,
  ...props
}: ChatProps) {
  return (
    <div className={cn(S.root, className, isEmpty && S.isEmpty)} {...props}>
      {scopeId ? (
        <div className={S.header}>
          <ChatSelector
            id={scopeId}
            onChatDeleted={onChatDeleted}
            onNewChat={onNewChat}
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}

Chat.Prompt = ChatPrompt;
Chat.Message = ChatMessage;
Chat.Presets = ChatPresets;
Chat.EmptyState = ChatEmptyState;
