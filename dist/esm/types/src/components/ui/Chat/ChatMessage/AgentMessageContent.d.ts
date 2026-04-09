import { type ReactNode } from 'react';
export declare function AgentMessageContent({ text, onQuickReply, suppressedQuickReplyKeys, quickReplyDisabled, isLastMessage, scriptContinue, onScriptContinue, renderMessageChart, }: {
    text: string;
    onQuickReply?: (branchKey: string, displayLabel: string) => void;
    suppressedQuickReplyKeys?: ReadonlySet<string>;
    quickReplyDisabled?: boolean;
    isLastMessage?: boolean;
    scriptContinue?: {
        label: string;
    };
    onScriptContinue?: () => void;
    renderMessageChart?: () => ReactNode;
}): import("react/jsx-runtime").JSX.Element;
