import type { JSONContent } from '@tiptap/core';

export const CHAT_PROMPT_EMPTY_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export function chatPromptParagraphDoc(text: string): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : [],
      },
    ],
  };
}
