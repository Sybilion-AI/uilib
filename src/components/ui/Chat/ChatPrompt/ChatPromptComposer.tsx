import {
  type ChangeEvent,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import { PaperclipIcon, SendHorizontalIcon } from 'lucide-react';

import { Button } from '../../Button';
import type { ChatAttachmentDropItem } from '../Chat.types';
import S from './ChatPrompt.styl';
import {
  type ChatPromptComposerHandle,
  createChatPromptComposerHandle,
} from './chatPromptComposerInsert';

export type {
  ChatPromptComposerHandle,
  ChatPromptComposerInsertOptions,
} from './ChatPromptComposer.types';

export type ChatPromptComposerProps = {
  editor: Editor;
  disabled: boolean;
  trimmedMessage: string;
  attachments: ChatAttachmentDropItem[];
  attachmentAccept?: string;
  onAttachmentFiles?: (files: File[]) => void;
};

export const ChatPromptComposer = forwardRef<
  ChatPromptComposerHandle,
  ChatPromptComposerProps
>(function ChatPromptComposer(
  {
    editor,
    disabled,
    trimmedMessage,
    attachments,
    attachmentAccept,
    onAttachmentFiles,
  },
  ref,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showAttachButton = Boolean(attachmentAccept && onAttachmentFiles);

  useImperativeHandle(ref, () => createChatPromptComposerHandle(editor), [
    editor,
  ]);

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = '';
      if (files.length > 0) {
        onAttachmentFiles?.(files);
      }
    },
    [onAttachmentFiles],
  );

  const canSubmit = Boolean(trimmedMessage || attachments.length > 0);

  return (
    <div className={S.composer}>
      {showAttachButton ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={attachmentAccept}
            multiple
            className={S.fileInput}
            disabled={disabled}
            onChange={handleFileInputChange}
          />
          <Button
            type="button"
            variant="ghost"
            icon
            size="sm"
            className={S.attachButton}
            aria-label="Attach file"
            disabled={disabled}
            onClick={e => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            <PaperclipIcon size={16} />
          </Button>
        </>
      ) : null}

      <div className={S.editorWrap}>
        <EditorContent editor={editor} className={S.editorMount} />
      </div>

      <div className={S.submitColumn}>
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !canSubmit}
          onMouseDown={e => e.preventDefault()}
        >
          <SendHorizontalIcon size={16} />
        </Button>
      </div>
    </div>
  );
});
