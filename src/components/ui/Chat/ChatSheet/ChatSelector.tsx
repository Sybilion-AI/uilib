import { Chat } from '@/components/ui/Chat/Chat.types';
import { useChatsForDataset } from '@/contexts/chat-context';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../Select/Select';

export interface ChatSelectorProps {
  id: string;
  className?: string;
}

export function ChatSelector({ id, className }: ChatSelectorProps) {
  const { chats, currentChatId, setCurrentChatId, newChat } =
    useChatsForDataset(id);

  const handleValueChange = (value: string) => {
    if (value === 'new') {
      newChat();
    } else {
      setCurrentChatId(value);
    }
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
    <Select
      value={currentChatId?.toString() ?? ''}
      onValueChange={handleValueChange}
    >
      <SelectTrigger size="sm" className={className}>
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
  );
}
