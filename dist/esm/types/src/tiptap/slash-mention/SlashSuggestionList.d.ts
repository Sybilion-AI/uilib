import type { RefObject } from 'react';
import type { SlashCommandItem } from './types';
export type SlashSuggestionListHandle = {
    onKeyboardEvent: (event: KeyboardEvent) => boolean;
};
/** Props forwarded from Tiptap suggestion renderer + our wiring. */
export type SlashSuggestionListProps = {
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
    listHandleRef: RefObject<SlashSuggestionListHandle | null>;
};
export declare function SlashSuggestionList(props: SlashSuggestionListProps): import("react/jsx-runtime").JSX.Element;
