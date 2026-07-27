import type {
  ChatAttachmentDropItem,
  ChatSendMessagePayload,
  UserTextFileAttachment,
} from './Chat.types';
import { sanitizeAttachmentFilename } from './sanitizeAttachmentFilename';

function defaultExtForAttachment(item: ChatAttachmentDropItem): string {
  const name = item.file.name.toLowerCase();
  if (item.kind === 'pdf' || name.endsWith('.pdf')) return 'pdf';
  if (item.kind === 'docx' || name.endsWith('.docx')) return 'docx';
  if (item.kind === 'xlsx' || name.endsWith('.xlsx')) return 'xlsx';
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'md';
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'html';
  if (name.endsWith('.xml')) return 'xml';
  if (name.endsWith('.yaml') || name.endsWith('.yml')) return 'yaml';
  if (name.endsWith('.tsv')) return 'tsv';
  if (name.endsWith('.ics')) return 'ics';
  return 'txt';
}

function dropItemToUserAttachment(
  item: ChatAttachmentDropItem,
): UserTextFileAttachment {
  const ext = defaultExtForAttachment(item);
  return {
    displayName: item.file.name,
    filename: sanitizeAttachmentFilename(item.file.name, ext),
    content: item.text,
  };
}

function buildApiMessage(
  displayText: string,
  attachments: readonly ChatAttachmentDropItem[],
): string {
  const parts = [
    displayText,
    ...attachments.map(item => item.text.trim()).filter(Boolean),
  ].filter(Boolean);
  return parts.join('\n\n');
}

/** Resolve file attachments on a send payload. */
export function normalizeUserTextFileAttachments(
  payload: ChatSendMessagePayload,
): UserTextFileAttachment[] {
  return payload.userTextFileAttachments ?? [];
}

/**
 * Build `sendMessage` input from composer text and staged drop items.
 * Returns a plain string when there are no attachments.
 */
export function buildChatSendMessagePayload(
  displayText: string,
  attachments: readonly ChatAttachmentDropItem[],
): string | ChatSendMessagePayload {
  const trimmed = displayText.trim();
  if (attachments.length === 0) {
    return trimmed;
  }

  const userTextFileAttachments = attachments.map(dropItemToUserAttachment);

  return {
    apiMessage: buildApiMessage(trimmed, attachments),
    // Keep empty when send is attachment-only — filename shows on the card, not as a text bubble.
    displayText: trimmed,
    userTextFileAttachments,
  };
}

/** Display text from a string or structured send payload. */
export function displayTextFromSendPayload(
  message: string | ChatSendMessagePayload,
): string {
  return typeof message === 'string' ? message : message.displayText;
}

/** Optional loading shimmer label from a structured send payload. */
export function loadingLabelFromSendPayload(
  message: string | ChatSendMessagePayload,
): string | undefined {
  if (typeof message === 'string') return undefined;
  return message.loadingLabel ?? message.systemProgressLabel;
}
