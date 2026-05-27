import type { Editor, JSONContent } from '@tiptap/core';

export type ChatPromptComposerInsertOptions = {
  /**
   * Doc range to replace before insert (e.g. slash suggestion `range` covering `/query`).
   * When set, `replaceTriggerToken` is ignored.
   */
  replaceRange?: { from: number; to: number };
  /**
   * When true and no `replaceRange`, delete text from caret back to the preceding
   * space or start of line before insert. Default true.
   */
  replaceTriggerToken?: boolean;
  /** Append a space after inserted content so the user can keep typing. Default true. */
  trailingSpace?: boolean;
};

/** Global class for inline command chips inserted via `insertAtCaret`. */
export const CHAT_PROMPT_COMMAND_CHIP_CLASS = 'chat-prompt-command-chip';

export type ChatPromptComposerHandle = {
  /** Insert HTML string or TipTap JSON at the caret (or after clearing trigger text). */
  insertAtCaret: (
    content: string | JSONContent,
    options?: ChatPromptComposerInsertOptions,
  ) => void;
  focus: () => void;
  getEditor: () => Editor;
};

/** Range of the unfinished token immediately before `pos` (back to space or line start). */
export function getChatPromptTokenRangeBeforePos(
  editor: Editor,
  pos: number,
): { from: number; to: number } {
  const $pos = editor.state.doc.resolve(pos);
  const textBefore = $pos.parent.textBetween(
    0,
    $pos.parentOffset,
    undefined,
    '\ufffc',
  );
  const token = textBefore.match(/[^\s]*$/)?.[0] ?? '';
  return { from: pos - token.length, to: pos };
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Build inline chip HTML for `insertAtCaret` (uses global `CHAT_PROMPT_COMMAND_CHIP_CLASS`). */
export function chatPromptChipHtml(
  text: string,
  className: string = CHAT_PROMPT_COMMAND_CHIP_CLASS,
): string {
  const cls = className ? ` class="${className}"` : '';
  return `<span${cls} data-chat-prompt-chip="true">${escapeHtml(text)}</span>`;
}

export function insertChatPromptContentAtCaret(
  editor: Editor,
  content: string | JSONContent,
  options?: ChatPromptComposerInsertOptions,
): void {
  if (editor.isDestroyed) return;

  const {
    replaceRange,
    replaceTriggerToken = true,
    trailingSpace = true,
  } = options ?? {};

  const { from: selFrom, to: selTo } = editor.state.selection;
  let from: number;
  let to: number;

  if (replaceRange) {
    from = replaceRange.from;
    to = replaceRange.to;
  } else if (replaceTriggerToken) {
    ({ from, to } = getChatPromptTokenRangeBeforePos(editor, selFrom));
  } else {
    from = selFrom;
    to = selTo;
  }

  const chain = editor.chain().focus().deleteRange({ from, to });

  if (typeof content === 'string') {
    chain.insertContentAt(from, trailingSpace ? `${content} ` : content);
  } else {
    chain.insertContentAt(from, content);
    if (trailingSpace) {
      chain.insertContent(' ');
    }
  }

  chain.run();

  queueMicrotask(() => {
    editor.view.dom.ownerDocument?.defaultView
      ?.getSelection?.()
      ?.collapseToEnd();
  });
}

export function createChatPromptComposerHandle(
  editor: Editor,
): ChatPromptComposerHandle {
  return {
    insertAtCaret: (content, options) =>
      insertChatPromptContentAtCaret(editor, content, options),
    focus: () => {
      editor.commands.focus();
    },
    getEditor: () => editor,
  };
}
