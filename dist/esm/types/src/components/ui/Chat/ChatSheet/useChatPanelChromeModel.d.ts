import { ChatPreset, type ScriptCompletePayload } from '#uilib/components/ui/Chat/Chat.types';
import type { SlashCommandItem } from '#uilib/tiptap/slash-mention/types';
import type { ChatChromeProps } from '../ChatChrome';
import type { ChatAttachmentDropItem } from '../ChatChrome/ChatChrome.types';
import type { ChatEmptyStateConfig } from '../ChatEmptyState/ChatEmptyState.types';
export type UseChatPanelChromeModelInput = {
    /** When true, skip sidebar chat slot, URL `?chat=`, and portal behavior (e.g. page main content). */
    embedAsPage: boolean;
    presets?: ChatPreset[];
    /** Composite chat scope (e.g. `${userId}-${datasetId}`, `${userId}-dashboard`, `${userId}-report-${reportId}`). */
    scopeId?: string | null;
    onMessage?: (message: string) => void;
    /** Fires when a preset script has no further `[Label|branchKey]` steps (graph leaf or linear script end). */
    onScriptComplete?: (payload: ScriptCompletePayload) => void;
    /** Generate dashboard from chat transcript (e.g. via `/generate-dashboard` slash command). */
    onGenerateDashboard?: (transcript: string) => void | Promise<void>;
    /** Renders `[CHART]` tokens in assistant messages. */
    renderMessageChart?: () => React.ReactNode;
    /** Forwarded to `ChatChrome` when the thread is empty. */
    emptyState?: ChatEmptyStateConfig;
    /** MIME types / extensions for text-only chat attachments (filtered by uilib allowlist). */
    allowedAttachments?: readonly string[];
    /** When true, PDF drops are accepted and parsed to plain text. */
    allowPdfAttachments?: boolean;
    onAttachmentsDropped?: (items: ChatAttachmentDropItem[]) => void | Promise<void>;
    /** Slash menu (`/`) in the composer; omit or pass empty to disable. */
    slashCommandItems?: SlashCommandItem[];
};
export type UseChatPanelChromeModelResult = {
    chromeProps: ChatChromeProps;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    toggleOpen: () => void;
    newChat: () => void;
    chatPanelContainer: HTMLElement | null;
};
export declare function useChatPanelChromeModel({ embedAsPage, presets, scopeId, onMessage, onScriptComplete, onGenerateDashboard, renderMessageChart, emptyState, allowedAttachments, allowPdfAttachments, onAttachmentsDropped, slashCommandItems, }: UseChatPanelChromeModelInput): UseChatPanelChromeModelResult;
