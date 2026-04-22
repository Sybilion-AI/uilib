import { ChatPreset, type ScriptCompletePayload } from '#uilib/components/ui/Chat/Chat.types';
import type { ChatChromeProps } from '../ChatChrome';
export type UseChatPanelChromeModelInput = {
    /** When true, skip sidebar chat slot, URL `?chat=`, and portal behavior (e.g. page main content). */
    embedAsPage: boolean;
    presets?: ChatPreset[];
    /** Composite chat scope (e.g. `${userId}-${datasetId}`, `${userId}-dashboard`, `${userId}-report-${reportId}`). */
    scopeId?: string | null;
    onMessage?: (message: string) => void;
    /** Fires when a preset script has no further `[Label|branchKey]` steps (graph leaf or linear script end). */
    onScriptComplete?: (payload: ScriptCompletePayload) => void;
    /** After intake script completes, user can generate a dashboard from the full transcript (e.g. Decision board). */
    onGenerateDashboard?: (transcript: string) => void | Promise<void>;
    /** Renders `[CHART]` tokens in assistant messages. */
    renderMessageChart?: () => React.ReactNode;
};
export type UseChatPanelChromeModelResult = {
    chromeProps: ChatChromeProps;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    toggleOpen: () => void;
    newChat: () => void;
    chatPanelContainer: HTMLElement | null;
};
export declare function useChatPanelChromeModel({ embedAsPage, presets, scopeId, onMessage, onScriptComplete, onGenerateDashboard, renderMessageChart, }: UseChatPanelChromeModelInput): UseChatPanelChromeModelResult;
