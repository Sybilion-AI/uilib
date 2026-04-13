import { ChatPreset, type ScriptCompletePayload } from '#uilib/components/ui/Chat/Chat.types';
export type ChatSheetActions = {
    open: () => void;
    /** Starts a new chat session and opens the panel (same as the new-chat keyboard shortcut). */
    openNewChat: () => void;
};
export interface ChatSheetProps {
    title?: string;
    /** Imperative open / new-chat for triggers outside `renderTrigger` (e.g. sidebar). */
    actionsRef?: React.MutableRefObject<ChatSheetActions | null>;
    renderTrigger?: (toggleOpen: () => void) => React.ReactNode;
    triggerLabel?: React.ReactNode;
    /** aria-label for icon-only trigger (required when trigger has no visible text) */
    triggerAriaLabel?: string;
    presets?: ChatPreset[];
    label?: string;
    /** Composite chat scope (e.g. `${userId}-${datasetId}`, `${userId}-dashboard`, `${userId}-report-${reportId}`). */
    scopeId?: string | null;
    onMessage?: (message: string) => void;
    /** Fires when a preset script has no further `[Label|branchKey]` steps (graph leaf or linear script end). */
    onScriptComplete?: (payload: ScriptCompletePayload) => void;
    /** After intake script completes, user can generate a dashboard from the full transcript (e.g. Decision board). */
    onGenerateDashboard?: (transcript: string) => void | Promise<void>;
    /** Renders `[CHART]` tokens in assistant messages. */
    renderMessageChart?: () => React.ReactNode;
}
export declare function ChatSheet({ triggerLabel, triggerAriaLabel, actionsRef, renderTrigger, presets, scopeId, onMessage, onScriptComplete, onGenerateDashboard, renderMessageChart, }: ChatSheetProps): import("react/jsx-runtime").JSX.Element;
