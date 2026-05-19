import type { ChatAttachmentDropItem, ChatSendMessagePayload, UserTextFileAttachment } from './Chat.types';
/** Resolve file attachments on a send payload. */
export declare function normalizeUserTextFileAttachments(payload: ChatSendMessagePayload): UserTextFileAttachment[];
/**
 * Build `sendMessage` input from composer text and staged drop items.
 * Returns a plain string when there are no attachments.
 */
export declare function buildChatSendMessagePayload(displayText: string, attachments: readonly ChatAttachmentDropItem[]): string | ChatSendMessagePayload;
/** Display text from a string or structured send payload. */
export declare function displayTextFromSendPayload(message: string | ChatSendMessagePayload): string;
