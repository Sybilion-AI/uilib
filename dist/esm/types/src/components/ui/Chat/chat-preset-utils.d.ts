import type { ChatPreset, Message } from './Chat.types';
/** Full chat text for dashboard / downstream tools (role-prefixed lines). */
export declare function formatChatTranscript(messages: Message[]): string;
/** Match button label (`preset.text`) to user message body; normalize to avoid trivial mismatches. */
export declare function normalizePresetMatchText(s: string): string;
export declare function usedPresetIdsFromMessages(messages: Message[] | undefined, presets: ChatPreset[] | undefined): string[];
