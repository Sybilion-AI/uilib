import type { RefObject } from 'react';
import type { Message } from '#uilib/components/ui/Chat/Chat.types';
import type { ChatPresetsLayout } from '#uilib/components/ui/Chat/ChatPresets';
import { ScrollRef } from '@homecode/ui';
export type ChatChromeResizeHandleConfig = {
    isActive: boolean;
    startWidthPx: number;
    getShellWidth: () => number;
    onDragWidth: (rawPx: number) => void;
    onDragComplete: (finalRawPx: number) => void;
};
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
    showBranchActionsRow: boolean;
    showSyntheticBranchButtons: boolean;
    unusedBranchKeys: string[];
    isScriptComplete: boolean;
    onGenerateDashboard: ((transcript: string) => void | Promise<void>) | undefined;
    generatingDashboard: boolean;
    onGenerateDashboardClick: () => void;
    showInlinePresets: boolean;
    isLastMessageFromUser: boolean;
    scrollRef: RefObject<ScrollRef | null>;
    effectiveScopeId: string;
    onPromptSubmit: (message: string) => void | Promise<void>;
    onChatDeleted: (sessionId: string) => void;
}
export declare function ChatChrome({ showResizeHandle, resizeHandle, onClose, isEmpty, renderPresets, messages, onQuickReply, suppressedQuickReplyKeys, isLoading, scriptContinueLabel, onScriptContinue, renderMessageChart, showBranchActionsRow, showSyntheticBranchButtons, unusedBranchKeys, isScriptComplete, onGenerateDashboard, generatingDashboard, onGenerateDashboardClick, showInlinePresets, isLastMessageFromUser, scrollRef, effectiveScopeId, onPromptSubmit, onChatDeleted, }: ChatChromeProps): import("react/jsx-runtime").JSX.Element;
