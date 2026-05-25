import type { MutableRefObject } from 'react';

import { type Editor, mergeAttributes } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import type { EditorState } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import type { SuggestionProps } from '@tiptap/suggestion';

import {
  SlashSuggestionList,
  type SlashSuggestionListHandle,
} from './SlashSuggestionList';
import { filterSlashItems } from './defaultChatSlashItems';
import type {
  CreateSlashMentionExtensionOptions,
  SlashCommandItem,
  SlashSuggestionPlacement,
} from './types';

const SUGGESTION_GAP_PX = 4;

function placeSlashSuggestionPopup(
  popupElement: HTMLElement,
  clientRect: DOMRect | null | undefined,
  placement: SlashSuggestionPlacement,
): void {
  if (!clientRect) return;

  const el = popupElement;
  const popupHeight = el.getBoundingClientRect().height;
  const spaceBelow = window.innerHeight - clientRect.bottom - SUGGESTION_GAP_PX;
  const spaceAbove = clientRect.top - SUGGESTION_GAP_PX;

  let showAbove = placement === 'above';
  if (placement === 'auto') {
    showAbove = spaceBelow < popupHeight && spaceAbove >= spaceBelow;
  }

  const top = showAbove
    ? Math.max(
        SUGGESTION_GAP_PX,
        clientRect.top - popupHeight - SUGGESTION_GAP_PX,
      )
    : clientRect.bottom + SUGGESTION_GAP_PX;

  el.style.left = `${clientRect.left}px`;
  el.style.top = `${top}px`;
}

export function slashMentionSuggestionRender(
  uiRef: MutableRefObject<SlashSuggestionListHandle | null>,
  placement: SlashSuggestionPlacement = 'below',
): {
  onStart?: (
    props: SuggestionProps<SlashCommandItem, SlashCommandItem>,
  ) => void;
  onUpdate?: (
    props: SuggestionProps<SlashCommandItem, SlashCommandItem>,
  ) => void;
  onExit?: (props: SuggestionProps<SlashCommandItem, SlashCommandItem>) => void;
  onKeyDown?: (p: {
    view: unknown;
    event: KeyboardEvent;
    range: { from: number; to: number };
  }) => boolean;
} {
  let popup: ReactRenderer<{
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
    listHandleRef: MutableRefObject<SlashSuggestionListHandle | null>;
  }> | null = null;

  const place = (
    props: Pick<
      SuggestionProps<SlashCommandItem, SlashCommandItem>,
      'clientRect'
    >,
  ) => {
    if (!popup?.element) return;
    placeSlashSuggestionPopup(
      popup.element,
      props.clientRect?.() ?? null,
      placement,
    );
  };

  return {
    onStart: props => {
      uiRef.current = null;
      popup?.destroy?.();
      popup = new ReactRenderer(SlashSuggestionList, {
        editor: props.editor,
        props: {
          items: props.items,
          command: props.command,
          listHandleRef: uiRef,
        },
      });
      popup.element.style.position = 'fixed';
      popup.element.style.margin = '0';
      popup.element.style.zIndex = '10002';
      document.body.append(popup.element);
      place(props);
      requestAnimationFrame(() => place(props));
    },
    onUpdate: props => {
      if (!popup) return;
      popup.updateProps({
        items: props.items,
        command: props.command,
        listHandleRef: uiRef,
      });
      place(props);
      requestAnimationFrame(() => place(props));
    },
    onExit: () => {
      popup?.destroy();
      popup?.element?.remove?.();
      popup = null;
      uiRef.current = null;
    },
    onKeyDown: ({ event }) =>
      uiRef.current?.onKeyboardEvent(event as KeyboardEvent) ?? false,
  };
}

function clearSlashTriggerEditor(
  editor: Editor,
  range: { from: number; to: number },
): void {
  if (editor.isDestroyed) return;
  try {
    editor.chain().focus().deleteRange(range).clearContent().run();
  } catch {
    // Editor view may be tearing down during suggestion exit.
  }
}

function collapseEditorSelectionEnd(editor: Editor): void {
  if (editor.isDestroyed) return;
  try {
    editor.view?.dom?.ownerDocument?.defaultView
      ?.getSelection?.()
      ?.collapseToEnd();
  } catch {
    // view.dom throws when editor is not mounted
  }
}
function insertDefaultMention(
  editor: Editor,
  range: { from: number; to: number },
  props: SlashCommandItem,
  slashChar: string,
): void {
  const nodeAfter = editor.view.state.selection.$to.nodeAfter;
  const extend = nodeAfter?.text?.startsWith(' ') ? 1 : 0;
  const adjusted = extend ? { ...range, to: range.to + extend } : range;

  editor
    .chain()
    .focus()
    .insertContentAt(adjusted, [
      {
        type: 'mention',
        attrs: {
          id: props.id,
          label: props.label,
          mentionSuggestionChar: slashChar,
        },
      },
      { type: 'text', text: ' ' },
    ])
    .run();

  queueMicrotask(() => {
    editor.view.dom.ownerDocument?.defaultView
      ?.getSelection?.()
      ?.collapseToEnd();
  });
}

function allowSlashTrigger({
  state,
  range,
}: {
  editor: Editor;
  state: EditorState;
  range: { from: number; to: number };
}) {
  const type = state.schema.nodes['mention'];
  const $from = state.doc.resolve(range.from);
  if (!type || !$from.parent.type.contentMatch.matchType(type)) return false;
  if ($from.parentOffset === 0) return true;
  const before = state.doc.textBetween(range.from - 1, range.from);
  return /\s/.test(before);
}

export type CreateSlashMentionExtensionConfiguredOptions =
  CreateSlashMentionExtensionOptions & {
    onSuggestionUiActiveChange?: (active: boolean) => void;
  };

export function createSlashMentionExtension({
  items: resolvedItems,
  slashChar = '/',
  pluginKey,
  onItemCommand,
  suggestionPlacement = 'below',
  onSuggestionUiActiveChange,
}: CreateSlashMentionExtensionConfiguredOptions) {
  const uiRef: MutableRefObject<SlashSuggestionListHandle | null> = {
    current: null,
  };

  return Mention.configure({
    renderText({ node }) {
      return `/${node.attrs.id as string}`;
    },
    renderHTML({ options, node, suggestion }) {
      const suggestionChar = suggestion?.char ?? slashChar;
      const id =
        typeof node.attrs.id === 'string'
          ? node.attrs.id
          : String(node.attrs.id ?? '');
      return [
        'span',
        mergeAttributes(
          {
            'data-type': 'mention',
            'data-slash-command': id,
            class: 'slash-mention',
          },
          options.HTMLAttributes,
        ),
        `${suggestionChar}${id}`,
      ];
    },
    suggestion: {
      char: slashChar,
      pluginKey,
      allowedPrefixes: [' ', '\n', '\t', '\r'],
      allow: props => allowSlashTrigger(props),
      items: ({ query }) =>
        Promise.resolve(filterSlashItems(resolvedItems, query)),
      command: ({ editor, range, props }) => {
        const item = props as SlashCommandItem;
        if (onItemCommand?.({ editor, range, item }) === true) {
          clearSlashTriggerEditor(editor, range);
          queueMicrotask(() => collapseEditorSelectionEnd(editor));
          return null;
        }
        insertDefaultMention(editor, range, item, slashChar);
        return null;
      },
      render: () => {
        const menu = slashMentionSuggestionRender(uiRef, suggestionPlacement);
        return {
          ...menu,
          onStart: props => {
            onSuggestionUiActiveChange?.(true);
            menu.onStart?.(props);
          },
          onExit: props => {
            menu.onExit?.(props);
            onSuggestionUiActiveChange?.(false);
          },
        };
      },
    },
  });
}
