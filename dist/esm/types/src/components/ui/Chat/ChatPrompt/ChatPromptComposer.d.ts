import { type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Editor } from '@tiptap/core';
import type { ChatAttachmentDropItem } from '../Chat.types';
export type ChatPromptComposerProps = {
    editor: Editor;
    disabled: boolean;
    trimmedMessage: string;
    attachments: ChatAttachmentDropItem[];
    attachmentAccept?: string;
    onAttachmentFiles?: (files: File[]) => void;
    onComposerKeyDown: (event: ReactKeyboardEvent) => void;
};
export declare function ChatPromptComposer({ editor, disabled, trimmedMessage, attachments, attachmentAccept, onAttachmentFiles, onComposerKeyDown, }: ChatPromptComposerProps): import("react/jsx-runtime").JSX.Element;
