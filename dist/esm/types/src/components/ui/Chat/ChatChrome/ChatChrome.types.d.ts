import type { RefObject } from 'react';
import type { ChatAttachmentDropItem, Message } from '#uilib/components/ui/Chat/Chat.types';
import type { ChatEmptyStateProps } from '#uilib/components/ui/Chat/ChatEmptyState/ChatEmptyState.types';
import type { ChatPresetsLayout } from '#uilib/components/ui/Chat/ChatPresets';
import type { SlashCommandItem, SlashOnItemCommand } from '#uilib/tiptap/slash-mention/types';
import type { ScrollRef } from '@homecode/ui';
export type ChatChromeResizeHandleConfig = {
    isActive: boolean;
    startWidthPx: number;
    getShellWidth: () => number;
    onDragWidth: (rawPx: number) => void;
    onDragComplete: (finalRawPx: number) => void;
};
export type { ChatAttachmentDropItem };
export interface ChatChromeProps {
    showResizeHandle: boolean;
    resizeHandle: ChatChromeResizeHandleConfig | undefined;
    onClose: (() => void) | undefined;
    isEmpty: boolean;
    renderPresets: (layout: ChatPresetsLayout) => React.ReactNode;
    /** Message list for the scroll area; use `[]` when empty. */
    messages: Message[];
    onQuickReply: (branchKey: string, displayLabel: string) => void;
    suppressedQuickReplyKeys: ReadonlySet<string>;
    isLoading: boolean;
    scriptContinueLabel: string | undefined;
    onScriptContinue: (() => void) | undefined;
    renderMessageChart?: () => React.ReactNode;
    showSyntheticBranchButtons: boolean;
    unusedBranchKeys: string[];
    showInlinePresets: boolean;
    isLastMessageFromUser: boolean;
    scrollRef: RefObject<ScrollRef | null>;
    effectiveScopeId: string;
    onPromptSubmit: (message: string, attachments?: ChatAttachmentDropItem[]) => void | Promise<void>;
    onChatDeleted: (sessionId: string) => void;
    /** `?prompt=` deep link text for one-shot composer pre-fill. */
    promptPrefill?: string | null;
    footerClassName?: string;
    emptyState?: ChatEmptyStateProps;
    /** MIME types / extensions (filtered to text-only allowlist). Enables dropzone when non-empty. */
    allowedAttachments?: readonly string[];
    /** When true, PDF files are accepted and parsed to plain text on drop. */
    allowPdfAttachments?: boolean;
    /** Optional hook when attachments are sent with a message. */
    onAttachmentsDropped?: (items: ChatAttachmentDropItem[]) => void | Promise<void>;
    /** Slash menu (`/`), forwarded to `Chat.Prompt`; omit or pass empty list to disable slash palette. */
    slashCommandItems?: SlashCommandItem[];
    /** Custom slash pick handler; forwarded to `Chat.Prompt`. */
    onSlashItemCommand?: SlashOnItemCommand;
    /** Composer placeholder forwarded to `Chat.Prompt`. */
    promptPlaceholder?: string;
}
