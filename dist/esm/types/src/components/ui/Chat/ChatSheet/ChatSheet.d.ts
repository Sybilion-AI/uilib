import { type UseChatPanelChromeModelInput } from './useChatPanelChromeModel';
export type ChatSheetActions = {
    open: () => void;
    /** Starts a new chat session and opens the panel (same as the new-chat keyboard shortcut). */
    openNewChat: () => void;
};
export interface ChatSheetProps extends Omit<UseChatPanelChromeModelInput, 'embedAsPage'> {
    title?: string;
    /** Imperative open / new-chat for triggers outside `renderTrigger` (e.g. sidebar). */
    actionsRef?: React.MutableRefObject<ChatSheetActions | null>;
    renderTrigger?: (toggleOpen: () => void) => React.ReactNode;
    triggerLabel?: React.ReactNode;
    /** aria-label for icon-only trigger (required when trigger has no visible text) */
    triggerAriaLabel?: string;
    label?: string;
    /**
     * Render chat panel in place (no trigger, no portal, no `?chat=` URL, no shell chat slot).
     * Prefer composing `ChatChrome` with `useChatPanelChromeModel({ embedAsPage: true, ... })` on the page.
     */
    inline?: boolean;
}
export declare function ChatSheet({ triggerLabel, triggerAriaLabel, actionsRef, renderTrigger, presets, scopeId, onMessage, onScriptComplete, onGenerateDashboard, renderMessageChart, emptyState, allowedAttachments, allowPdfAttachments, onAttachmentsDropped, slashCommandItems, inline, }: ChatSheetProps): import("react/jsx-runtime").JSX.Element;
