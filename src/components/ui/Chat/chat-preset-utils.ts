import type { ChatPreset, Message } from './Chat.types';
import { MessageRole } from './Chat.types';

/** Full chat text for dashboard / downstream tools (role-prefixed lines). */
export function formatChatTranscript(messages: Message[]): string {
  return messages.map(m => `${m.role}: ${m.text}`).join('\n');
}

/** Match button label (`preset.text`) to user message body; normalize to avoid trivial mismatches. */
export function normalizePresetMatchText(s: string): string {
  return s.trim().normalize('NFC');
}

export function usedPresetIdsFromMessages(
  messages: Message[] | undefined,
  presets: ChatPreset[] | undefined,
): string[] {
  if (!messages?.length || !presets?.length) return [];
  const userTexts = new Set(
    messages
      .filter(m => m.role === MessageRole.USER)
      .map(m => normalizePresetMatchText(m.text)),
  );
  return presets
    .filter(p => userTexts.has(normalizePresetMatchText(p.text)))
    .map(p => p.id);
}
