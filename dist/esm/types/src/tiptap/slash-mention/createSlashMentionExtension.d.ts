import type { MutableRefObject } from 'react';
import type { SuggestionProps } from '@tiptap/suggestion';
import { type SlashSuggestionListHandle } from './SlashSuggestionList';
import type { CreateSlashMentionExtensionOptions, SlashCommandItem, SlashSuggestionPlacement } from './types';
export declare function slashMentionSuggestionRender(uiRef: MutableRefObject<SlashSuggestionListHandle | null>, placement?: SlashSuggestionPlacement): {
    onStart?: (props: SuggestionProps<SlashCommandItem, SlashCommandItem>) => void;
    onUpdate?: (props: SuggestionProps<SlashCommandItem, SlashCommandItem>) => void;
    onExit?: (props: SuggestionProps<SlashCommandItem, SlashCommandItem>) => void;
    onKeyDown?: (p: {
        view: unknown;
        event: KeyboardEvent;
        range: {
            from: number;
            to: number;
        };
    }) => boolean;
};
export type CreateSlashMentionExtensionConfiguredOptions = CreateSlashMentionExtensionOptions & {
    onSuggestionUiActiveChange?: (active: boolean) => void;
};
export declare function createSlashMentionExtension({ items: resolvedItems, slashChar, pluginKey, onItemCommand, suggestionPlacement, onSuggestionUiActiveChange, }: CreateSlashMentionExtensionConfiguredOptions): import("@tiptap/core").Node<import("@tiptap/extension-mention").MentionOptions<any, import("@tiptap/extension-mention").MentionNodeAttrs>, any>;
