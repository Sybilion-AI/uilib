import { MessageRole } from './Chat.types.js';

/** Full chat text for dashboard / downstream tools (role-prefixed lines). */
function formatChatTranscript(messages) {
    return messages.map(m => `${m.role}: ${m.text}`).join('\n');
}
/** Match button label (`preset.text`) to user message body; normalize to avoid trivial mismatches. */
function normalizePresetMatchText(s) {
    return s.trim().normalize('NFC');
}
function presetMatchesUserText(presetText, userTextNorm) {
    const presetNorm = normalizePresetMatchText(presetText);
    if (!presetNorm)
        return false;
    if (userTextNorm === presetNorm)
        return true;
    const prefix = `${presetNorm} `;
    return userTextNorm.startsWith(prefix);
}
function usedPresetIdsFromMessages(messages, presets) {
    if (!messages?.length || !presets?.length)
        return [];
    const userTexts = messages
        .filter(m => m.role === MessageRole.USER)
        .map(m => normalizePresetMatchText(m.text));
    return presets
        .filter(p => userTexts.some(ut => presetMatchesUserText(p.text, ut)))
        .map(p => p.id);
}

export { formatChatTranscript, normalizePresetMatchText, usedPresetIdsFromMessages };
