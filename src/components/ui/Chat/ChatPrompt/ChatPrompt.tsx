import cn from 'classnames';
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import useEvent from '#uilib/hooks/useEvent';
import { SendHorizontalIcon } from 'lucide-react';

import { Button } from '../../Button';
import { Input } from '../../Input';
import type { ChatPromptProps } from '../Chat.types';
import { syncChatPromptTextareaHeight } from './ChatPrompt.helpers';
import S from './ChatPrompt.styl';

export function ChatPrompt({
  onSubmit,
  placeholder,
  className,
  footer,
  prefillMessage,
  showNotice = true,
}: ChatPromptProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    syncChatPromptTextareaHeight(el, message);
  }, [message]);

  useEffect(() => {
    if (prefillMessage != null && prefillMessage !== '') {
      setMessage(prefillMessage);
    }
  }, [prefillMessage]);

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
      <div className={S.composer}>
        {showNotice ? (
          <div className={S.notice}>Forecast Assistant can make mistakes.</div>
        ) : null}

        <Input
          ref={inputRef}
          type="textarea"
          rows={1}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={placeholder || 'Type a message...'}
          className={cn(S.input)}
        />

        <div className={S.submitColumn}>
          <Button type="submit" size="sm" disabled={!message.trim()}>
            <SendHorizontalIcon size={16} />
          </Button>
        </div>

        {/* <Button
          variant="outline"
          size="sm"
          onClick={e => e.preventDefault()}
          className={S.attachButton}
          >
          <PaperclipIcon size={16} />
          </Button> */}
      </div>

      {footer}
    </form>
  );
}
