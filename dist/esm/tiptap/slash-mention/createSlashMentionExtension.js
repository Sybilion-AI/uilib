import { mergeAttributes } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { SlashSuggestionList } from './SlashSuggestionList.js';
import { filterSlashItems } from './defaultChatSlashItems.js';

function slashMentionSuggestionRender(uiRef) {
    let popup = null;
    const place = (props) => {
        if (!popup?.element)
            return;
        const rect = props.clientRect?.();
        if (!rect)
            return;
        const el = popup.element;
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.bottom + 4}px`;
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
        },
        onUpdate: props => {
            if (!popup)
                return;
            popup.updateProps({
                items: props.items,
                command: props.command,
                listHandleRef: uiRef,
            });
            place(props);
        },
        onExit: () => {
            popup?.destroy();
            popup?.element?.remove?.();
            popup = null;
            uiRef.current = null;
        },
        onKeyDown: ({ event }) => uiRef.current?.onKeyboardEvent(event) ?? false,
    };
}
function insertDefaultMention(editor, range, props, slashChar) {
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
function allowSlashTrigger({ state, range, }) {
    const type = state.schema.nodes['mention'];
    const $from = state.doc.resolve(range.from);
    if (!type || !$from.parent.type.contentMatch.matchType(type))
        return false;
    if ($from.parentOffset === 0)
        return true;
    const before = state.doc.textBetween(range.from - 1, range.from);
    return /\s/.test(before);
}
function createSlashMentionExtension({ items: resolvedItems, slashChar = '/', pluginKey, onItemCommand, onSuggestionUiActiveChange, }) {
    const uiRef = {
        current: null,
    };
    return Mention.configure({
        renderText({ node }) {
            return `/${node.attrs.id}`;
        },
        renderHTML({ options, node, suggestion }) {
            const suggestionChar = suggestion?.char ?? slashChar;
            const id = typeof node.attrs.id === 'string'
                ? node.attrs.id
                : String(node.attrs.id ?? '');
            return [
                'span',
                mergeAttributes({
                    'data-type': 'mention',
                    'data-slash-command': id,
                    class: 'slash-mention',
                }, options.HTMLAttributes),
                `${suggestionChar}${id}`,
            ];
        },
        suggestion: {
            char: slashChar,
            pluginKey,
            allowedPrefixes: [' ', '\n', '\t', '\r'],
            allow: props => allowSlashTrigger(props),
            items: ({ query }) => Promise.resolve(filterSlashItems(resolvedItems, query)),
            command: ({ editor, range, props }) => {
                const item = props;
                if (onItemCommand?.({ editor, range, item }) === true) {
                    queueMicrotask(() => {
                        editor.view.dom.ownerDocument?.defaultView
                            ?.getSelection?.()
                            ?.collapseToEnd();
                    });
                    return null;
                }
                insertDefaultMention(editor, range, item, slashChar);
                return null;
            },
            render: () => {
                const menu = slashMentionSuggestionRender(uiRef);
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

export { createSlashMentionExtension, slashMentionSuggestionRender };
