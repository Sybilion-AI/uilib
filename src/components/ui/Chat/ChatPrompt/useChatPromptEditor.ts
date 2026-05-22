import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DEFAULT_CHAT_SLASH_ITEMS,
  createSlashMentionExtension,
} from '#uilib/tiptap/slash-mention';
import type { SlashCommandItem } from '#uilib/tiptap/slash-mention/types';
import type { AnyExtension, Editor } from '@tiptap/core';
import { Placeholder } from '@tiptap/extensions';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {
  chatPromptSafeEditorDom,
  syncChatPromptComposerHeight,
} from './ChatPrompt.helpers';
import { CHAT_PROMPT_EMPTY_DOC, chatPromptParagraphDoc } from './chatPromptDoc';

export type UseChatPromptEditorOptions = {
  disabled: boolean;
  placeholder?: string;
  slashCommandItems?: SlashCommandItem[];
  prefillMessage?: string | null;
  /** Staged attachment count — Enter-to-send when text empty but files present. */
  attachmentsCount?: number;
  /** Called when user presses Enter to send (after guards). */
  onEnterSubmit: () => void;
};

export type UseChatPromptEditorResult = {
  editor: Editor | null;
  trimmedMessage: string;
  resetAfterSend: () => void;
  handleComposerKeyDown: (event: ReactKeyboardEvent) => void;
};

export function useChatPromptEditor({
  disabled,
  placeholder,
  slashCommandItems,
  prefillMessage,
  attachmentsCount = 0,
  onEnterSubmit,
}: UseChatPromptEditorOptions): UseChatPromptEditorResult {
  const slashOpenRef = useRef(false);
  const suggestionActiveUpdater = useCallback((active: boolean) => {
    slashOpenRef.current = active;
  }, []);

  const slashFinger = JSON.stringify(slashCommandItems ?? null);
  const slashItemsStable = useMemo(() => {
    return slashCommandItems ?? DEFAULT_CHAT_SLASH_ITEMS;
  }, [slashCommandItems, slashFinger]);

  const placeholderText = useMemo(() => {
    if (placeholder === undefined || placeholder === null) {
      return 'Type a message…';
    }
    const t = String(placeholder).trim();
    return t === '' ? 'Type a message…' : t;
  }, [placeholder]);

  const ariaLabelComposer = useMemo(() => {
    if (placeholder === undefined || placeholder === null) return 'Message';
    const t = String(placeholder).trim();
    return t === '' ? 'Message' : t;
  }, [placeholder]);

  const extensions = useMemo(() => {
    const exts: AnyExtension[] = [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: placeholderText,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ];
    if (slashItemsStable.length > 0) {
      exts.push(
        createSlashMentionExtension({
          items: slashItemsStable,
          onSuggestionUiActiveChange: suggestionActiveUpdater,
        }),
      );
    }
    return exts;
  }, [slashItemsStable, placeholderText, suggestionActiveUpdater]);

  const [plainDraft, setPlainDraft] = useState('');

  const editorDomRef = useRef<HTMLElement | null>(null);

  const bindEditorDom = useCallback(({ editor }: { editor: Editor }) => {
    setPlainDraft(editor.getText());
    queueMicrotask(() => {
      const dom = chatPromptSafeEditorDom(editor);
      if (!dom) return;
      editorDomRef.current = dom;
      syncChatPromptComposerHeight(dom, editor.getText());
    });
  }, []);

  const trimmedMessage = plainDraft.trim();

  const editor = useEditor(
    {
      extensions,
      content: CHAT_PROMPT_EMPTY_DOC,
      editable: !disabled,
      immediatelyRender: true,
      editorProps: {
        attributes: {
          spellcheck: 'true',
          'aria-label': ariaLabelComposer,
        },
      },
      onTransaction: ({ editor: ed }) => {
        const dom = chatPromptSafeEditorDom(ed);
        if (dom) {
          syncChatPromptComposerHeight(dom, ed.getText());
        }
        setPlainDraft(ed.getText());
      },
      onCreate: bindEditorDom,
    },
    [extensions, disabled, bindEditorDom, ariaLabelComposer],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const bind = () => {
      editorDomRef.current = chatPromptSafeEditorDom(editor);
    };
    bind();
    let rafId: number | null = null;
    if (typeof window !== 'undefined') {
      rafId = window.requestAnimationFrame(bind);
    }
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || prefillMessage == null || prefillMessage === '') return;
    editor.commands.setContent(chatPromptParagraphDoc(prefillMessage));
    const t = editor.getText();
    setPlainDraft(t);
    queueMicrotask(() => {
      const dom = chatPromptSafeEditorDom(editor);
      if (dom) syncChatPromptComposerHeight(dom, t);
    });
  }, [editor, prefillMessage]);

  useLayoutEffect(() => {
    if (!editor) return;
    const dom = chatPromptSafeEditorDom(editor);
    if (!dom) return;
    syncChatPromptComposerHeight(dom, plainDraft);
  }, [editor, plainDraft]);

  const onEnterSubmitRef = useRef(onEnterSubmit);
  onEnterSubmitRef.current = onEnterSubmit;

  const resetAfterSend = useCallback(() => {
    if (!editor) return;
    editor.commands.clearContent();
    queueMicrotask(() => {
      const dom = chatPromptSafeEditorDom(editor);
      if (dom) syncChatPromptComposerHeight(dom, '');
    });
    setPlainDraft('');
  }, [editor]);

  const handleComposerKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (!(e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey))
        return;
      if (!editorDomRef.current?.contains(e.target as Node)) return;
      if (slashOpenRef.current) return;
      if (!trimmedMessage && attachmentsCount === 0) return;
      e.preventDefault();
      onEnterSubmitRef.current();
    },
    [attachmentsCount, trimmedMessage],
  );

  return {
    editor,
    trimmedMessage,
    resetAfterSend,
    handleComposerKeyDown,
  };
}
