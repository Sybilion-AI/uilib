import cn from 'classnames';
import { FormEvent, useCallback, useRef } from 'react';

import type { ChatPromptProps } from '../Chat.types';
import S from './ChatPrompt.styl';
import { ChatPromptAttachments } from './ChatPromptAttachments';
import { ChatPromptComposer } from './ChatPromptComposer';
import { useChatPromptEditor } from './useChatPromptEditor';

export function ChatPrompt({
  onSubmit,
  placeholder,
  className,
  footer,
  prefillMessage,
  slashCommandItems,
  onSlashItemCommand,
  attachments = [],
  onRemoveAttachment,
  disabled = false,
  attachmentAccept,
  onAttachmentFiles,
}: ChatPromptProps) {
  const attachmentsCount = attachments.length;

  const emitSubmitRef = useRef(() => {});
  const { editor, trimmedMessage, resetAfterSend } = useChatPromptEditor({
    disabled,
    placeholder,
    slashCommandItems,
    onSlashItemCommand,
    prefillMessage,
    attachmentsCount,
    onEnterSubmit: () => emitSubmitRef.current(),
  });

  const emitSubmitAndClear = useCallback(() => {
    if (!editor) return;
    if (!trimmedMessage && attachmentsCount === 0) return;

    const msg = trimmedMessage;
    resetAfterSend();
    onSubmit(msg, attachmentsCount > 0 ? attachments : undefined);
  }, [
    attachments,
    attachmentsCount,
    editor,
    onSubmit,
    resetAfterSend,
    trimmedMessage,
  ]);

  emitSubmitRef.current = emitSubmitAndClear;

  const handleSubmitForm = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      emitSubmitAndClear();
    },
    [emitSubmitAndClear],
  );

  if (!editor) {
    return null;
  }

  return (
    <form onSubmit={handleSubmitForm} className={cn(S.root, className)}>
      <ChatPromptAttachments
        attachments={attachments}
        onRemove={index => onRemoveAttachment?.(index)}
        disabled={disabled}
      />
      <ChatPromptComposer
        editor={editor}
        disabled={disabled}
        trimmedMessage={trimmedMessage}
        attachments={attachments}
        attachmentAccept={attachmentAccept}
        onAttachmentFiles={onAttachmentFiles}
      />
      {footer}
    </form>
  );
}
