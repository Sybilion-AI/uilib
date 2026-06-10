import type { Chat } from '#uilib/components/ui/Chat/Chat.types';
import { LS } from '@homecode/ui';

import {
  isEphemeralChatScope,
  safeLsSet,
  stripChatsForPersistence,
} from './chatPersistence';

export type ChatScopeIndex = {
  currentSessionId: string | null;
  sessionIds: string[];
};

export const CHAT_SCOPE_IDS_REGISTRY_KEY = 'chat-scope-ids';

const SESSION_PREFIX = 'chat-session-';
const SCOPE_PREFIX = 'chat-scope-';
const CHATS_PREFIX = 'chats-';
const CHAT_CURRENT_ID_PREFIX = 'chat-current-id-';

function getSessionKey(sessionId: string): string {
  return `${SESSION_PREFIX}${sessionId}`;
}

function getScopeKey(scopeId: string): string {
  return `${SCOPE_PREFIX}${scopeId}`;
}

function getLegacyChatsKey(scopeId: string): string {
  return `${CHATS_PREFIX}${scopeId}`;
}

function getLegacyCurrentIdKey(scopeId: string): string {
  return `${CHAT_CURRENT_ID_PREFIX}${scopeId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isChat(value: unknown): value is Chat {
  if (!isRecord(value)) return false;
  return (
    typeof value.session_id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.messages)
  );
}

function isChatScopeIndex(value: unknown): value is ChatScopeIndex {
  if (!isRecord(value)) return false;
  const { currentSessionId, sessionIds } = value;
  if (currentSessionId !== null && typeof currentSessionId !== 'string') {
    return false;
  }
  if (!Array.isArray(sessionIds)) return false;
  return sessionIds.every(id => typeof id === 'string');
}

function trimScopeIndexForPersistence(
  scopeId: string,
  index: ChatScopeIndex,
): ChatScopeIndex {
  if (!isEphemeralChatScope(scopeId)) return index;
  const current = index.currentSessionId ?? index.sessionIds[0] ?? null;
  if (!current) return { currentSessionId: null, sessionIds: [] };
  return { currentSessionId: current, sessionIds: [current] };
}

function mergeSessionChat(existing: Chat | null, incoming: Chat): Chat {
  if (!existing) return incoming;
  return incoming.messages.length >= existing.messages.length
    ? incoming
    : existing;
}

export function loadSession(sessionId: string): Chat | null {
  const raw = LS.get(getSessionKey(sessionId));
  return isChat(raw) ? raw : null;
}

export function persistSession(chat: Chat): void {
  const [stripped] = stripChatsForPersistence([chat]);
  safeLsSet(getSessionKey(chat.session_id), stripped);
}

export function deleteSessionBlob(sessionId: string): void {
  LS.remove(getSessionKey(sessionId));
}

export function loadScopeIndex(scopeId: string): ChatScopeIndex | null {
  const raw = LS.get(getScopeKey(scopeId));
  return isChatScopeIndex(raw) ? raw : null;
}

export function persistScopeIndex(
  scopeId: string,
  index: ChatScopeIndex,
): void {
  safeLsSet(getScopeKey(scopeId), trimScopeIndexForPersistence(scopeId, index));
}

export function addScopeIdToRegistry(scopeId: string): void {
  const raw = LS.get(CHAT_SCOPE_IDS_REGISTRY_KEY);
  const registry = Array.isArray(raw) ? [...raw] : [];
  if (!registry.includes(scopeId)) {
    safeLsSet(CHAT_SCOPE_IDS_REGISTRY_KEY, [...registry, scopeId]);
  }
}

export function discoverScopeIdsFromLS(): Set<string> {
  const scopeIds = new Set<string>();
  const registryRaw = LS.get(CHAT_SCOPE_IDS_REGISTRY_KEY);
  const registry = Array.isArray(registryRaw) ? registryRaw : [];
  registry.forEach((id: unknown) => {
    if (typeof id === 'string' && id) scopeIds.add(id);
  });
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(SCOPE_PREFIX)) {
        const scopeId = key.slice(SCOPE_PREFIX.length);
        if (scopeId) scopeIds.add(scopeId);
      } else if (key.startsWith(CHATS_PREFIX)) {
        const scopeId = key.slice(CHATS_PREFIX.length);
        if (scopeId) scopeIds.add(scopeId);
      }
    }
  } catch {
    // ignore
  }
  return scopeIds;
}

export function scopeIdsForUser(userId: number, all: Set<string>): Set<string> {
  const prefix = `${userId}-`;
  const out = new Set<string>();
  for (const id of all) {
    if (id.startsWith(prefix)) out.add(id);
  }
  return out;
}

export function hasLegacyScopeData(scopeId: string): boolean {
  const legacyRaw = LS.get(getLegacyChatsKey(scopeId));
  return Array.isArray(legacyRaw) && legacyRaw.length > 0;
}

export function migrateLegacyScope(scopeId: string): ChatScopeIndex | null {
  const legacyRaw = LS.get(getLegacyChatsKey(scopeId));
  const legacyChats = Array.isArray(legacyRaw) ? legacyRaw : [];
  const chats: Chat[] = [];
  legacyChats.forEach(item => {
    if (isChat(item)) chats.push(item);
  });
  if (chats.length === 0) return loadScopeIndex(scopeId);

  const savedCurrentRaw = LS.get(getLegacyCurrentIdKey(scopeId));
  const savedCurrentId =
    typeof savedCurrentRaw === 'string' && savedCurrentRaw !== ''
      ? savedCurrentRaw
      : undefined;
  const currentSessionId = savedCurrentId ?? chats[0]?.session_id ?? null;
  const sessionIds = chats.map(chat => chat.session_id);

  chats.forEach(chat => {
    const existing = loadSession(chat.session_id);
    persistSession(mergeSessionChat(existing, chat));
  });

  const index: ChatScopeIndex = { currentSessionId, sessionIds };
  persistScopeIndex(scopeId, index);
  addScopeIdToRegistry(scopeId);
  LS.remove(getLegacyChatsKey(scopeId));
  LS.remove(getLegacyCurrentIdKey(scopeId));
  return index;
}

export type LinkSessionToScopeOptions = {
  makeCurrent?: boolean;
};

export function linkSessionToScope(
  scopeId: string,
  sessionId: string,
  options?: LinkSessionToScopeOptions,
): ChatScopeIndex {
  addScopeIdToRegistry(scopeId);
  const existing = loadScopeIndex(scopeId) ?? {
    currentSessionId: null,
    sessionIds: [],
  };
  const sessionIds = existing.sessionIds.includes(sessionId)
    ? existing.sessionIds
    : [sessionId, ...existing.sessionIds];
  const makeCurrent = options?.makeCurrent !== false;
  const index: ChatScopeIndex = {
    sessionIds,
    currentSessionId: makeCurrent ? sessionId : existing.currentSessionId,
  };
  persistScopeIndex(scopeId, index);
  return index;
}

export function hydrateChatsForScope(scopeId: string): Chat[] {
  const index = loadScopeIndex(scopeId);
  if (!index) return [];
  return index.sessionIds
    .map(sessionId => loadSession(sessionId))
    .filter((chat): chat is Chat => chat != null);
}

export function countSessionReferences(
  userId: number,
  sessionId: string,
): number {
  const scopeIds = scopeIdsForUser(userId, discoverScopeIdsFromLS());
  let count = 0;
  for (const scopeId of scopeIds) {
    const index = loadScopeIndex(scopeId);
    if (index?.sessionIds.includes(sessionId)) count += 1;
  }
  return count;
}

export function removeSessionFromScope(
  scopeId: string,
  sessionId: string,
): ChatScopeIndex | null {
  const existing = loadScopeIndex(scopeId);
  if (!existing) return null;
  const sessionIds = existing.sessionIds.filter(id => id !== sessionId);
  if (sessionIds.length === existing.sessionIds.length) return existing;

  let nextCurrent = existing.currentSessionId;
  if (nextCurrent === sessionId) {
    const deletedIndex = existing.sessionIds.indexOf(sessionId);
    nextCurrent =
      deletedIndex > 0
        ? existing.sessionIds[deletedIndex - 1]
        : (sessionIds[0] ?? null);
  }

  const index: ChatScopeIndex = {
    currentSessionId: nextCurrent,
    sessionIds,
  };
  persistScopeIndex(scopeId, index);
  return index;
}

export function renameSessionId(
  userId: number,
  oldId: string,
  newId: string,
): void {
  if (oldId === newId) return;
  const chat = loadSession(oldId);
  if (!chat) return;
  persistSession({ ...chat, session_id: newId });
  LS.remove(getSessionKey(oldId));

  const scopeIds = scopeIdsForUser(userId, discoverScopeIdsFromLS());
  for (const scopeId of scopeIds) {
    const index = loadScopeIndex(scopeId);
    if (!index?.sessionIds.includes(oldId)) continue;
    const sessionIds = index.sessionIds.map(id => (id === oldId ? newId : id));
    const currentSessionId =
      index.currentSessionId === oldId ? newId : index.currentSessionId;
    persistScopeIndex(scopeId, { currentSessionId, sessionIds });
  }
}

export function loadChatsFromSessionStorage(userId: number): {
  chats: Record<string, Chat[]>;
  currentChatId: Record<string, string | null>;
} {
  const chats: Record<string, Chat[]> = {};
  const currentChatId: Record<string, string | null> = {};
  const scopeIds = scopeIdsForUser(userId, discoverScopeIdsFromLS());

  for (const scopeId of scopeIds) {
    if (hasLegacyScopeData(scopeId)) {
      migrateLegacyScope(scopeId);
    }
    const index = loadScopeIndex(scopeId);
    if (!index || index.sessionIds.length === 0) continue;
    chats[scopeId] = hydrateChatsForScope(scopeId);
    currentChatId[scopeId] =
      index.currentSessionId ?? chats[scopeId][0]?.session_id ?? null;
  }

  return { chats, currentChatId };
}

/** Alias used by ChatProvider mount hydration. */
export const loadAllScopesForUser = loadChatsFromSessionStorage;

export function isSessionReferencedByScopes(
  sessionId: string,
  excludeScopeId: string | null,
  userId: number,
): boolean {
  const scopeIds = scopeIdsForUser(userId, discoverScopeIdsFromLS());
  for (const scopeId of scopeIds) {
    if (excludeScopeId && scopeId === excludeScopeId) continue;
    const index = loadScopeIndex(scopeId);
    if (index?.sessionIds.includes(sessionId)) return true;
  }
  return false;
}

export function renameSessionIdInStorage(
  oldId: string,
  newId: string,
  userId: number,
): void {
  renameSessionId(userId, oldId, newId);
}
