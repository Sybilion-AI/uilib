import type { ChatAttachmentDropItem } from './Chat.types';
import {
  buildChatSendMessagePayload,
  displayTextFromSendPayload,
  normalizeUserTextFileAttachments,
} from './buildChatSendMessagePayload';

function makeDropItem(
  name: string,
  text: string,
  kind: 'text' | 'pdf' = 'text',
): ChatAttachmentDropItem {
  return {
    file: { name } as File,
    text,
    kind,
  };
}

describe('buildChatSendMessagePayload', () => {
  it('returns trimmed string when there are no attachments', () => {
    expect(buildChatSendMessagePayload('  hello  ', [])).toBe('hello');
  });

  it('builds payload with user text and full file bodies in apiMessage', () => {
    const result = buildChatSendMessagePayload('Question', [
      makeDropItem('data.csv', 'a,b\n1,2'),
    ]);
    expect(typeof result).toBe('object');
    if (typeof result === 'string') {
      throw new Error('expected payload object');
    }
    expect(result.displayText).toBe('Question');
    expect(result.apiMessage).toBe('Question\n\na,b\n1,2');
    expect(result.userTextFileAttachments).toHaveLength(1);
    expect(result.userTextFileAttachments?.[0].displayName).toBe('data.csv');
    expect(result.userTextFileAttachments?.[0].content).toBe('a,b\n1,2');
    expect(result.userTextFileAttachments?.[0].filename).toMatch(/\.csv$/i);
  });

  it('uses first file name as displayText when message is empty', () => {
    const result = buildChatSendMessagePayload('', [
      makeDropItem('report.pdf', 'pdf text', 'pdf'),
    ]);
    if (typeof result === 'string') {
      throw new Error('expected payload object');
    }
    expect(result.displayText).toBe('report.pdf');
    expect(result.apiMessage).toBe('report.pdf\n\npdf text');
    expect(result.userTextFileAttachments?.[0].filename).toMatch(/\.pdf$/i);
  });

  it('maps multiple attachments', () => {
    const result = buildChatSendMessagePayload('Hi', [
      makeDropItem('one.txt', 'first'),
      makeDropItem('two.txt', 'second'),
    ]);
    if (typeof result === 'string') {
      throw new Error('expected payload object');
    }
    expect(result.userTextFileAttachments).toHaveLength(2);
    expect(result.apiMessage).toBe('Hi\n\nfirst\n\nsecond');
  });
});

describe('normalizeUserTextFileAttachments', () => {
  it('returns userTextFileAttachments or empty array', () => {
    const attachment = {
      displayName: 'data.csv',
      filename: 'data.csv',
      content: 'x',
    };
    expect(
      normalizeUserTextFileAttachments({
        apiMessage: 'a',
        displayText: 'b',
        userTextFileAttachments: [attachment],
      }),
    ).toEqual([attachment]);
    expect(
      normalizeUserTextFileAttachments({
        apiMessage: 'a',
        displayText: 'b',
      }),
    ).toEqual([]);
  });
});

describe('displayTextFromSendPayload', () => {
  it('returns string as-is', () => {
    expect(displayTextFromSendPayload('plain')).toBe('plain');
  });

  it('returns displayText from payload', () => {
    expect(
      displayTextFromSendPayload({
        apiMessage: 'full',
        displayText: 'short',
      }),
    ).toBe('short');
  });
});
