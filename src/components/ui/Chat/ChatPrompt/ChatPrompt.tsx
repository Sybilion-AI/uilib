import cn from 'classnames';
import { FormEvent, useState } from 'react';

import { ChatSelector } from '#uilib/components/ui/Chat/ChatSheet/ChatSelector';
import { useChatsForScopeId } from '#uilib/contexts/chat-context';
import useEvent from '#uilib/hooks/useEvent';
import { SendHorizontalIcon, Trash2Icon } from 'lucide-react';

import { Button } from '../../Button';
import { Input } from '../../Input';
import type { ChatPromptProps } from '../Chat.types';
import S from './ChatPrompt.styl';

export function ChatPrompt({
  onSubmit,
  placeholder,
  className,
  footer,
  id,
  onChatDeleted,
}: ChatPromptProps) {
  const [message, setMessage] = useState('');
  const { currentChatId, deleteChat, chats } = useChatsForScopeId(id);

  const handleDeleteChat = () => {
    if (!currentChatId) return;
    const sid = currentChatId;
    deleteChat(sid);
    onChatDeleted?.(sid);
  };

  const handleSubmit = (e: FormEvent | KeyboardEvent) => {
    const trimmedMessage = message.trim();

    if (trimmedMessage) {
      e.preventDefault();
      onSubmit(trimmedMessage);
      setMessage('');
    }
  };

  useEvent({
    event: 'keydown',
    callback: (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.metaKey || e.shiftKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit(e);
        setMessage('');
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className={cn(S.root, className)}>
      <Input
        type="textarea"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={placeholder || 'Type a message...'}
        className={cn(S.input)}
      />

      <div className={S.actions}>
        <Button type="submit" size="sm" disabled={!message.trim()}>
          <SendHorizontalIcon size={16} />
        </Button>

        <div className={S.notice}>Forecast Assistant can make mistakes.</div>

        {/* <Button
          variant="outline"
          size="sm"
          onClick={e => e.preventDefault()}
          className={S.attachButton}
          >
          <PaperclipIcon size={16} />
          </Button> */}
        <div className={S.selectorWrapper}>
          <ChatSelector id={id} className={S.selector} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Delete chat"
            disabled={!currentChatId || chats.length === 0}
            onClick={handleDeleteChat}
          >
            <Trash2Icon size={16} />
          </Button>
        </div>
      </div>

      {footer}
    </form>
  );
}
