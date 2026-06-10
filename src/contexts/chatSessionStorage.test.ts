import { MessageRole } from '#uilib/components/ui/Chat/Chat.types';
import type { Chat } from '#uilib/components/ui/Chat/Chat.types';

import {
  countSessionReferences,
  deleteSessionBlob,
  hydrateChatsForScope,
  linkSessionToScope,
  loadScopeIndex,
  loadSession,
  migrateLegacyScope,
  persistSession,
  removeSessionFromScope,
} from './chatSessionStorage';

const USER_ID = 42;
const DATASET_SCOPE = `${USER_ID}-dataset-1`;
const REPORT_SCOPE = `${USER_ID}-chats-report-r1`;
const SESSION_A = 'session-a';
const SESSION_B = 'session-b';

function makeChat(sessionId: string, messageCount: number): Chat {
  const messages = Array.from({ length: messageCount }, (_, index) => ({
    id: `${sessionId}-msg-${index}`,
    role: MessageRole.USER,
    text: `message-${index}`,
    timestamp: index,
  }));
  return { session_id: sessionId, name: '', messages };
}

describe('chatSessionStorage migration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('migrates legacy chats-* into session blobs and scope index', () => {
    const legacyChats = [makeChat(SESSION_A, 2), makeChat(SESSION_B, 1)];
    window.localStorage.setItem(
      `chats-${DATASET_SCOPE}`,
      JSON.stringify(legacyChats),
    );
    window.localStorage.setItem(
      `chat-current-id-${DATASET_SCOPE}`,
      JSON.stringify(SESSION_B),
    );

    migrateLegacyScope(DATASET_SCOPE);

    expect(window.localStorage.getItem(`chats-${DATASET_SCOPE}`)).toBeNull();
    expect(
      window.localStorage.getItem(`chat-current-id-${DATASET_SCOPE}`),
    ).toBeNull();

    const index = loadScopeIndex(DATASET_SCOPE);
    expect(index?.sessionIds).toEqual([SESSION_A, SESSION_B]);
    expect(index?.currentSessionId).toBe(SESSION_B);
    expect(loadSession(SESSION_A)?.messages).toHaveLength(2);
    expect(loadSession(SESSION_B)?.messages).toHaveLength(1);
  });

  it('keeps the richer session blob when duplicate ids exist during migration', () => {
    const sparse = makeChat(SESSION_A, 1);
    const rich = makeChat(SESSION_A, 4);
    window.localStorage.setItem(
      `chats-${DATASET_SCOPE}`,
      JSON.stringify([sparse, rich]),
    );

    migrateLegacyScope(DATASET_SCOPE);

    expect(loadSession(SESSION_A)?.messages).toHaveLength(4);
  });
});

describe('chatSessionStorage shared sessions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shares one session blob across two scopes', () => {
    persistSession(makeChat(SESSION_A, 1));
    linkSessionToScope(DATASET_SCOPE, SESSION_A, { makeCurrent: true });
    linkSessionToScope(REPORT_SCOPE, SESSION_A, { makeCurrent: true });

    const datasetChats = hydrateChatsForScope(DATASET_SCOPE);
    expect(datasetChats[0]?.messages).toHaveLength(1);

    const session = loadSession(SESSION_A);
    if (!session) throw new Error('expected session');
    persistSession({
      ...session,
      messages: [
        ...session.messages,
        {
          id: 'follow-up',
          role: MessageRole.ASSISTANT,
          text: 'merged',
          timestamp: 99,
        },
      ],
    });

    const reportChats = hydrateChatsForScope(REPORT_SCOPE);
    expect(reportChats[0]?.messages).toHaveLength(2);
    expect(reportChats[0]?.messages[1]?.text).toBe('merged');
  });

  it('keeps session blob until the last scope reference is removed', () => {
    persistSession(makeChat(SESSION_A, 1));
    linkSessionToScope(DATASET_SCOPE, SESSION_A);
    linkSessionToScope(REPORT_SCOPE, SESSION_A);

    expect(countSessionReferences(USER_ID, SESSION_A)).toBe(2);

    removeSessionFromScope(DATASET_SCOPE, SESSION_A);
    expect(loadSession(SESSION_A)).not.toBeNull();
    expect(countSessionReferences(USER_ID, SESSION_A)).toBe(1);

    removeSessionFromScope(REPORT_SCOPE, SESSION_A);
    expect(countSessionReferences(USER_ID, SESSION_A)).toBe(0);
    deleteSessionBlob(SESSION_A);
    expect(loadSession(SESSION_A)).toBeNull();
  });
});
