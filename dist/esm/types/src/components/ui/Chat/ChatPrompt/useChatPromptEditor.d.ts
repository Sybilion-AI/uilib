import { type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { SlashCommandItem } from '#uilib/tiptap/slash-mention/types';
import type { Editor } from '@tiptap/core';
export type UseChatPromptEditorOptions = {
    disabled: boolean;
    placeholder?: string;
    slashCommandItems?: SlashCommandItem[];
    prefillMessage?: string | null;
    /** Staged attachment count — Enter-to-send when text empty but files present. */
    attachmentsCount?: number;
    /** Called when user presses Enter to send (after guards). */
    onEnterSubmit: () => void;
};
export type UseChatPromptEditorResult = {
    editor: Editor | null;
    trimmedMessage: string;
    resetAfterSend: () => void;
    handleComposerKeyDown: (event: ReactKeyboardEvent) => void;
};
export declare function useChatPromptEditor({ disabled, placeholder, slashCommandItems, prefillMessage, attachmentsCount, onEnterSubmit, }: UseChatPromptEditorOptions): UseChatPromptEditorResult;
