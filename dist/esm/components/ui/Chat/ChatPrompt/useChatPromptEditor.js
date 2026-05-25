import { useRef, useCallback, useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { DEFAULT_CHAT_SLASH_ITEMS } from '../../../../tiptap/slash-mention/defaultChatSlashItems.js';
import { createSlashMentionExtension } from '../../../../tiptap/slash-mention/createSlashMentionExtension.js';
import { Placeholder } from '@tiptap/extensions';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { chatPromptSafeEditorDom, syncChatPromptComposerHeight } from './ChatPrompt.helpers.js';
import { CHAT_PROMPT_EMPTY_DOC, chatPromptParagraphDoc } from './chatPromptDoc.js';

function useChatPromptEditor({ disabled, placeholder, slashCommandItems, onSlashItemCommand, prefillMessage, attachmentsCount = 0, onEnterSubmit, }) {
    const slashOpenRef = useRef(false);
    const onSlashItemCommandRef = useRef(onSlashItemCommand);
    onSlashItemCommandRef.current = onSlashItemCommand;
    const suggestionActiveUpdater = useCallback((active) => {
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
        if (placeholder === undefined || placeholder === null)
            return 'Message';
        const t = String(placeholder).trim();
        return t === '' ? 'Message' : t;
    }, [placeholder]);
    const extensions = useMemo(() => {
        const exts = [
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
            exts.push(createSlashMentionExtension({
                items: slashItemsStable,
                suggestionPlacement: 'above',
                onSuggestionUiActiveChange: suggestionActiveUpdater,
                onItemCommand: ctx => onSlashItemCommandRef.current?.(ctx) === true,
            }));
        }
        return exts;
    }, [slashItemsStable, placeholderText, suggestionActiveUpdater]);
    const [plainDraft, setPlainDraft] = useState('');
    const editorDomRef = useRef(null);
    const bindEditorDom = useCallback(({ editor }) => {
        setPlainDraft(editor.getText());
        queueMicrotask(() => {
            const dom = chatPromptSafeEditorDom(editor);
            if (!dom)
                return;
            editorDomRef.current = dom;
            syncChatPromptComposerHeight(dom, editor.getText());
        });
    }, []);
    const trimmedMessage = plainDraft.trim();
    const editor = useEditor({
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
    }, [extensions, bindEditorDom, ariaLabelComposer]);
    useEffect(() => {
        if (!editor)
            return;
        editor.setEditable(!disabled);
    }, [editor, disabled]);
    useEffect(() => {
        if (!editor)
            return;
        const bind = () => {
            editorDomRef.current = chatPromptSafeEditorDom(editor);
        };
        bind();
        let rafId = null;
        if (typeof window !== 'undefined') {
            rafId = window.requestAnimationFrame(bind);
        }
        return () => {
            if (rafId != null)
                cancelAnimationFrame(rafId);
        };
    }, [editor]);
    useEffect(() => {
        if (!editor || prefillMessage == null || prefillMessage === '')
            return;
        editor.commands.setContent(chatPromptParagraphDoc(prefillMessage));
        const t = editor.getText();
        setPlainDraft(t);
        queueMicrotask(() => {
            const dom = chatPromptSafeEditorDom(editor);
            if (dom)
                syncChatPromptComposerHeight(dom, t);
        });
    }, [editor, prefillMessage]);
    useLayoutEffect(() => {
        if (!editor)
            return;
        const dom = chatPromptSafeEditorDom(editor);
        if (!dom)
            return;
        syncChatPromptComposerHeight(dom, plainDraft);
    }, [editor, plainDraft]);
    const onEnterSubmitRef = useRef(onEnterSubmit);
    onEnterSubmitRef.current = onEnterSubmit;
    const resetAfterSend = useCallback(() => {
        if (!editor)
            return;
        editor.commands.clearContent();
        queueMicrotask(() => {
            const dom = chatPromptSafeEditorDom(editor);
            if (dom)
                syncChatPromptComposerHeight(dom, '');
        });
        setPlainDraft('');
    }, [editor]);
    const handleComposerKeyDown = useCallback((e) => {
        if (!(e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey))
            return;
        if (!editorDomRef.current?.contains(e.target))
            return;
        if (slashOpenRef.current)
            return;
        if (!trimmedMessage && attachmentsCount === 0)
            return;
        e.preventDefault();
        onEnterSubmitRef.current();
    }, [attachmentsCount, trimmedMessage]);
    return {
        editor,
        trimmedMessage,
        resetAfterSend,
        handleComposerKeyDown,
    };
}

export { useChatPromptEditor };
