import { MessageRole } from '../Chat.types.js';

function normalizeBranchMatchText(s) {
    return s.trim().normalize('NFC');
}
function isPresetScriptGraph(script) {
    return (script != null &&
        typeof script === 'object' &&
        !Array.isArray(script) &&
        typeof script.initialMessage === 'string');
}
/** Branch map for quick-reply lookup (all keys except `initialMessage`). */
function branchesFromPresetScriptGraph(graph) {
    const { initialMessage: _im, ...rest } = graph;
    return rest;
}
/** Trailing ` [label]` defines the continue button; the rest is assistant body. */
function parseScriptLine(line) {
    const trimmed = line.trimEnd();
    const m = trimmed.match(/^([\s\S]*?)\s+\[([^\]]+)\]\s*$/);
    if (!m)
        return { displayBody: trimmed };
    return { displayBody: m[1].trimEnd(), buttonLabel: m[2].trim() };
}
/** Same bracket rules as AgentMessageContent quick-reply parsing (no markdown link `[](url)`). */
const QUICK_REPLY_BRACKET_RE = /\[(?!CHART\]|DOWNLOAD_BUTTONS\]|DOWNLOAD:)([^\]]+)\](?!\()/gi;
function textHasQuickReplyMarkers(text) {
    const re = new RegExp(QUICK_REPLY_BRACKET_RE.source, QUICK_REPLY_BRACKET_RE.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
        const inner = m[1].trim();
        const pipeIdx = inner.indexOf('|');
        const displayLabel = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner;
        const branchKey = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : inner;
        if (branchKey && displayLabel)
            return true;
    }
    return false;
}
/** Preset graph/linear step is done when assistant text has no `[Label|branchKey]` navigation. */
function isTerminalPresetScriptAssistantText(text) {
    return !textHasQuickReplyMarkers(text);
}
/**
 * Graph intake: complete after this assistant bubble only when it is the `complete`
 * node, or when `freeformNext` has no continuation for this key. Freeform prompts
 * (e.g. p_mar “last question”) have no markers — do not treat as terminal via
 * {@link isTerminalPresetScriptAssistantText} alone.
 */
function isGraphIntakeAssistantStepComplete(shownScriptKey, freeformNext, assistantBody) {
    if (shownScriptKey === 'complete')
        return true;
    const next = freeformNext[shownScriptKey];
    if (next != null && next !== '')
        return false;
    return isTerminalPresetScriptAssistantText(assistantBody);
}
function humanizeBranchKey(key) {
    return key
        .split(/[-_]+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}
/** Pairs from `[Label|branchKey]` (same rules as AgentMessageContent). */
function extractQuickReplyLabelKeyPairsFromText(text) {
    const out = [];
    const re = new RegExp(QUICK_REPLY_BRACKET_RE.source, QUICK_REPLY_BRACKET_RE.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
        const inner = m[1].trim();
        const pipeIdx = inner.indexOf('|');
        const displayLabel = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner;
        const branchKey = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : inner;
        if (branchKey && displayLabel) {
            out.push({ label: displayLabel, key: branchKey });
        }
    }
    return out;
}
/**
 * If `userText` matches a `[label|key]` pair on the assistant message (trimmed NFC), return it.
 */
function matchUserTextToQuickReply(assistantText, userText) {
    const uNorm = normalizeBranchMatchText(userText);
    for (const { label, key } of extractQuickReplyLabelKeyPairsFromText(assistantText)) {
        if (normalizeBranchMatchText(label) === uNorm) {
            return { key, label };
        }
    }
    return null;
}
/** First label seen in chat (assistant order) for a branch key; for synthetic row copy. */
function displayLabelForBranchKeyFromMessages(branchKey, messages) {
    if (!messages?.length)
        return undefined;
    for (const msg of messages) {
        if (msg.role !== MessageRole.ASSISTANT)
            continue;
        for (const pair of extractQuickReplyLabelKeyPairsFromText(msg.text)) {
            if (pair.key === branchKey)
                return pair.label;
        }
    }
    return undefined;
}
/**
 * Branch keys the user picked: USER line matches `[label|key]` on the **immediately
 * preceding** assistant only (avoids suppressing the same label re-offered on a later bubble).
 */
function branchKeysUsedFromChatHistory(messages) {
    if (!messages?.length)
        return [];
    const used = new Set();
    for (let i = 1; i < messages.length; i++) {
        const u = messages[i];
        if (u.role !== MessageRole.USER)
            continue;
        let j = i - 1;
        while (j >= 0 && messages[j].role !== MessageRole.ASSISTANT)
            j--;
        if (j < 0)
            continue;
        const a = messages[j];
        const uNorm = normalizeBranchMatchText(u.text);
        for (const { label, key } of extractQuickReplyLabelKeyPairsFromText(a.text)) {
            if (normalizeBranchMatchText(label) === uNorm)
                used.add(key);
        }
    }
    return [...used];
}
/**
 * User's last branch choice that led to the final assistant message: match the user
 * line before last to `[label|key]` on the nearest preceding assistant bubble.
 */
function entryBranchKeyBeforeLastAssistant(messages) {
    if (!messages?.length)
        return undefined;
    const lastIdx = messages.length - 1;
    if (messages[lastIdx].role !== MessageRole.ASSISTANT)
        return undefined;
    if (lastIdx < 2)
        return undefined;
    const userMsg = messages[lastIdx - 1];
    if (userMsg.role !== MessageRole.USER)
        return undefined;
    let i = lastIdx - 2;
    while (i >= 0 && messages[i].role !== MessageRole.ASSISTANT)
        i--;
    if (i < 0)
        return undefined;
    const prevAssistant = messages[i];
    const uNorm = normalizeBranchMatchText(userMsg.text);
    for (const { label, key } of extractQuickReplyLabelKeyPairsFromText(prevAssistant.text)) {
        if (normalizeBranchMatchText(label) === uNorm)
            return key;
    }
    return undefined;
}
/** Infer used branch keys from USER lines vs assistant `[label|key]` + humanized slug fallback. */
function branchKeysUsedByUserMessages(messages, validBranchKeys) {
    if (!messages?.length || !validBranchKeys.length)
        return [];
    const valid = new Set(validBranchKeys);
    const userNorm = new Set(messages
        .filter(m => m.role === MessageRole.USER)
        .map(m => normalizeBranchMatchText(m.text)));
    const used = new Set();
    for (const msg of messages) {
        if (msg.role !== MessageRole.ASSISTANT)
            continue;
        for (const { label, key } of extractQuickReplyLabelKeyPairsFromText(msg.text)) {
            if (valid.has(key) && userNorm.has(normalizeBranchMatchText(label))) {
                used.add(key);
            }
        }
    }
    for (const key of validBranchKeys) {
        if (userNorm.has(normalizeBranchMatchText(humanizeBranchKey(key)))) {
            used.add(key);
        }
    }
    return [...used];
}

export { branchKeysUsedByUserMessages, branchKeysUsedFromChatHistory, branchesFromPresetScriptGraph, displayLabelForBranchKeyFromMessages, entryBranchKeyBeforeLastAssistant, extractQuickReplyLabelKeyPairsFromText, humanizeBranchKey, isGraphIntakeAssistantStepComplete, isPresetScriptGraph, isTerminalPresetScriptAssistantText, matchUserTextToQuickReply, parseScriptLine, textHasQuickReplyMarkers };
