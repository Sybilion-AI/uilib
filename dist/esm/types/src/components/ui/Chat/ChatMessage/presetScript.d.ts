import type { Message } from '../Chat.types';
/** Branching demo: `initialMessage` + string-keyed nodes; buttons use `[Label|branchKey]`. */
export type PresetScriptGraph = {
    initialMessage: string;
} & Record<string, string>;
export declare function isPresetScriptGraph(script: string[] | string | PresetScriptGraph | undefined): script is PresetScriptGraph;
/**
 * Parse Script field: branching graph as JSON (full `{ ... }` or inner `"key": "value",` list),
 * or linear script as newline-separated lines. Empty input → undefined.
 */
export declare function parsePresetScriptFieldInput(raw: string, existing?: string[] | string | PresetScriptGraph): PresetScriptGraph | string[] | undefined;
/** Branch map for quick-reply lookup (all keys except `initialMessage`). */
export declare function branchesFromPresetScriptGraph(graph: PresetScriptGraph): Record<string, string>;
/** Trailing ` [label]` defines the continue button; the rest is assistant body. */
export declare function parseScriptLine(line: string): {
    displayBody: string;
    buttonLabel?: string;
};
export declare function textHasQuickReplyMarkers(text: string): boolean;
/** Preset graph/linear step is done when assistant text has no `[Label|branchKey]` navigation. */
export declare function isTerminalPresetScriptAssistantText(text: string): boolean;
/**
 * Graph intake: complete after this assistant bubble only when it is the `complete`
 * node, or when `freeformNext` has no continuation for this key. Freeform prompts
 * (e.g. p_mar “last question”) have no markers — do not treat as terminal via
 * {@link isTerminalPresetScriptAssistantText} alone.
 */
export declare function isGraphIntakeAssistantStepComplete(shownScriptKey: string, freeformNext: Record<string, string>, assistantBody: string): boolean;
export declare function humanizeBranchKey(key: string): string;
/** Pairs from `[Label|branchKey]` (same rules as AgentMessageContent). */
export declare function extractQuickReplyLabelKeyPairsFromText(text: string): Array<{
    label: string;
    key: string;
}>;
/**
 * If `userText` matches a `[label|key]` pair on the assistant message (trimmed NFC), return it.
 */
export declare function matchUserTextToQuickReply(assistantText: string, userText: string): {
    key: string;
    label: string;
} | null;
/** First label seen in chat (assistant order) for a branch key; for synthetic row copy. */
export declare function displayLabelForBranchKeyFromMessages(branchKey: string, messages: Message[] | undefined): string | undefined;
/**
 * Branch keys the user picked: USER line matches `[label|key]` on the **immediately
 * preceding** assistant only (avoids suppressing the same label re-offered on a later bubble).
 */
export declare function branchKeysUsedFromChatHistory(messages: Message[] | undefined): string[];
/**
 * User's last branch choice that led to the final assistant message: match the user
 * line before last to `[label|key]` on the nearest preceding assistant bubble.
 */
export declare function entryBranchKeyBeforeLastAssistant(messages: Message[] | undefined): string | undefined;
/** Infer used branch keys from USER lines vs assistant `[label|key]` + humanized slug fallback. */
export declare function branchKeysUsedByUserMessages(messages: Message[] | undefined, validBranchKeys: string[]): string[];
