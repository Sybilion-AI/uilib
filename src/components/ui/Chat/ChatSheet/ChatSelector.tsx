import cn from 'classnames';

import { Chat } from '#uilib/components/ui/Chat/Chat.types';
import type {
  SelectProps,
  SelectTriggerProps,
} from '#uilib/components/ui/Select/Select.types.js';
import { useChatsForScopeId } from '#uilib/contexts/chat-context';
import { Trash2Icon } from 'lucide-react';

import { Button } from '../../Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../Select/Select';
import S from './ChatSelector.styl';

export interface ChatSelectorProps
  extends SelectProps, Pick<SelectTriggerProps, 'size' | 'variant'> {
  id: string;
  wrapperClassName?: string;
  className?: string;
  onChatDeleted?: (sessionId: string) => void;
  /** When set, used for "+ New Chat" instead of the default empty `newChat()`. */
  onNewChat?: () => void;
}

const deleteIconSize = (s: NonNullable<SelectTriggerProps['size']>) =>
  s === 'sm' ? 16 : s === 'md' ? 18 : 20;

export function ChatSelector({
  id,
  size = 'sm',
  variant = 'clear',
  wrapperClassName,
  className,
  onChatDeleted,
  onNewChat,
}: ChatSelectorProps) {
  const { chats, currentChatId, setCurrentChatId, newChat, deleteChat } =
    useChatsForScopeId(id);

  const handleValueChange = (value: string) => {
    if (value === 'new') {
      if (onNewChat) {
        onNewChat();
      } else {
        newChat();
      }
    } else if (value) {
      setCurrentChatId(value);
    }
  };

  const handleDeleteChat = () => {
    if (!currentChatId) return;
    const sid = currentChatId;
    deleteChat(sid);
    onChatDeleted?.(sid);
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) {
      return chat.name;
    }
    if (chat.messages.length > 0) {
      const firstMessage = chat.messages[0];
      return (
        firstMessage.text.slice(0, 30) +
        (firstMessage.text.length > 30 ? '...' : '')
      );
    }
    return 'New chat';
  };

  return (
    <div
      className={cn(
        S.wrapper,
        variant === 'clear' ? S.variantClear : S.variantDefault,
        wrapperClassName,
      )}
    >
      <div className={S.selectGrow}>
        <Select
          variant={variant}
          value={currentChatId?.toString() ?? ''}
          onValueChange={handleValueChange}
        >
          <SelectTrigger
            size={size}
            variant={variant}
            className={
              className ? cn(S.selectTrigger, className) : S.selectTrigger
            }
          >
            <SelectValue placeholder="Select chat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">+ New Chat</SelectItem>
            {chats.map(chat => (
              <SelectItem
                key={chat.session_id}
                value={chat.session_id.toString()}
                selected={chat.session_id === currentChatId}
              >
                {getChatDisplayName(chat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {currentChatId && chats.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size={size}
          className={S.deleteBtn}
          aria-label="Delete chat"
          onClick={handleDeleteChat}
        >
          <Trash2Icon size={deleteIconSize(size)} />
        </Button>
      )}
    </div>
  );
}
