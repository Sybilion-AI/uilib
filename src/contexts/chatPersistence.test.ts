import { MessageRole } from '#uilib/components/ui/Chat/Chat.types';
import type { Chat } from '#uilib/components/ui/Chat/Chat.types';

import {
  persistChatsToLS,
  stripChatsForPersistence,
  stripMessageForPersistence,
} from './chatPersistence';

describe('stripMessageForPersistence', () => {
  it('removes json-dashboard fences from message text', () => {
    const message = stripMessageForPersistence({
      id: '1',
      role: MessageRole.ASSISTANT,
      text: 'Summary\n```json-dashboard\n{"tiles":[]}\n```',
      timestamp: 1,
    });

    expect(message.text).toBe('Summary');
  });

  it('strips from an unclosed json-dashboard fence', () => {
    const message = stripMessageForPersistence({
      id: '1b',
      role: MessageRole.ASSISTANT,
      text: 'Summary\n```json-dashboard\n{"tiles":[]}',
      timestamp: 1,
    });

    expect(message.text).toBe('Summary');
  });

  it('drops attachment content but keeps file metadata', () => {
    const message = stripMessageForPersistence({
      id: '2',
      role: MessageRole.USER,
      text: 'see file',
      timestamp: 2,
      userTextFileAttachments: [
        {
          displayName: 'Report',
          filename: 'report.pdf',
          content: 'x'.repeat(5000),
        },
      ],
    });

    expect(message.userTextFileAttachments).toEqual([
      { displayName: 'Report', filename: 'report.pdf', content: '' },
    ]);
  });
});

describe('stripChatsForPersistence', () => {
  it('filters in-progress messages', () => {
    const chats: Chat[] = [
      {
        session_id: 's1',
        name: '',
        messages: [
          {
            id: 'a',
            role: MessageRole.SYSTEM,
            text: 'Working...',
            timestamp: 1,
            inProgress: true,
          },
          {
            id: 'b',
            role: MessageRole.USER,
            text: 'hello',
            timestamp: 2,
          },
        ],
      },
    ];

    expect(stripChatsForPersistence(chats)[0].messages).toHaveLength(1);
    expect(stripChatsForPersistence(chats)[0].messages[0].id).toBe('b');
  });
});

describe('persistChatsToLS', () => {
  const quotaError = new DOMException('quota', 'QuotaExceededError');

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('swallows QuotaExceededError without throwing', () => {
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw quotaError;
      });

    expect(() =>
      persistChatsToLS('94-__reports_new_draft__', [
        {
          session_id: 's1',
          name: '',
          messages: [
            {
              id: '1',
              role: MessageRole.USER,
              text: 'hello',
              timestamp: 1,
            },
          ],
        },
      ]),
    ).not.toThrow();

    setItem.mockRestore();
  });

  it('persists only the latest session for ephemeral draft scopes', () => {
    persistChatsToLS('94-__reports_new_draft__', [
      {
        session_id: 'current',
        name: '',
        messages: [
          {
            id: '1',
            role: MessageRole.USER,
            text: 'current',
            timestamp: 1,
          },
        ],
      },
      {
        session_id: 'old',
        name: '',
        messages: [
          {
            id: '2',
            role: MessageRole.USER,
            text: 'old',
            timestamp: 2,
          },
        ],
      },
    ]);

    const stored = window.localStorage.getItem(
      'chats-94-__reports_new_draft__',
    );
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored ?? '[]');
    expect(parsed).toHaveLength(1);
    expect(parsed[0].session_id).toBe('current');
  });
});
