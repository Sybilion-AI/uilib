import cn from 'classnames';

import { Chat } from '#uilib/components/ui/Chat/Chat.types';
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

export interface ChatSelectorProps {
  id: string;
  className?: string;
  onChatDeleted?: (sessionId: string) => void;
}

export function ChatSelector({
  id,
  className,
  onChatDeleted,
}: ChatSelectorProps) {
  const { chats, currentChatId, setCurrentChatId, newChat, deleteChat } =
    useChatsForScopeId(id);

  const handleValueChange = (value: string) => {
    if (value === 'new') {
      newChat();
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
    return `Chat ${chat.session_id}`;
  };

  return (
    <div className={S.wrapper}>
      <div className={S.selectGrow}>
        <Select
          variant="clear"
          value={currentChatId?.toString() ?? ''}
          onValueChange={handleValueChange}
        >
          <SelectTrigger
            size="sm"
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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={S.deleteBtn}
        aria-label="Delete chat"
        disabled={!currentChatId || chats.length === 0}
        onClick={handleDeleteChat}
      >
        <Trash2Icon size={16} />
      </Button>
    </div>
  );
}
