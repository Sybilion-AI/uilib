import {
  type Chat,
  type Message,
  MessageRole,
  type UserTextFileAttachment,
} from '#uilib/components/ui/Chat/Chat.types';
import { stripJsonDashboardFences } from '#uilib/lib/dashboard-spec/stripJsonDashboardFences';
import { LS } from '@homecode/ui';

/** Ephemeral scopes (e.g. /reports/new draft) — keep only the latest session in LS. */
const EPHEMERAL_SCOPE_MARKERS = ['__reports_new_draft__'] as const;

export function isEphemeralChatScope(scopeId: string): boolean {
  return EPHEMERAL_SCOPE_MARKERS.some(marker => scopeId.endsWith(marker));
}

function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === 'QuotaExceededError' ||
    error.code === 22 ||
    error.code === 1014
  );
}

function stripAttachmentForPersistence(
  attachment: UserTextFileAttachment,
): UserTextFileAttachment {
  return {
    displayName: attachment.displayName,
    filename: attachment.filename,
    content: '',
  };
}

export function stripMessageForPersistence(message: Message): Message {
  const text =
    message.role === MessageRole.ASSISTANT
      ? message.text
      : stripJsonDashboardFences(message.text);
  const next: Message = { ...message, text };
  if (message.inProgress) {
    delete next.inProgress;
  }
  if (message.userTextFileAttachments?.length) {
    next.userTextFileAttachments = message.userTextFileAttachments.map(
      stripAttachmentForPersistence,
    );
  }
  return next;
}

export function stripChatsForPersistence(chats: Chat[]): Chat[] {
  return chats.map(chat => ({
    ...chat,
    messages: chat.messages
      .filter(message => !message.inProgress)
      .map(stripMessageForPersistence),
  }));
}

function chatsForScopePersistence(scopeId: string, chats: Chat[]): Chat[] {
  const scopeChats = isEphemeralChatScope(scopeId) ? chats.slice(0, 1) : chats;
  return stripChatsForPersistence(scopeChats);
}

export function persistSessionToLS(chat: Chat): void {
  const payload = stripChatsForPersistence([chat])[0];
  if (!payload) return;
  const sessionKey = `chat-session-${chat.session_id}`;
  try {
    LS.set(sessionKey, payload);
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
  }
}

/** @deprecated Legacy scope blob — prefer session + scope index via chatSessionStorage. */
export function persistChatsToLS(scopeId: string, chats: Chat[]): void {
  const chatsKey = `chats-${scopeId}`;
  const payload = chatsForScopePersistence(scopeId, chats);
  try {
    LS.set(chatsKey, payload);
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
  }
}

export function safeLsSet(key: string, value: unknown): void {
  try {
    LS.set(key, value);
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
  }
}
