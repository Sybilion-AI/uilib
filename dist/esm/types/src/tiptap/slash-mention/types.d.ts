import type { Editor, Range } from '@tiptap/core';
export type SlashCommandItem = {
    id: string;
    label: string;
    description?: string;
};
export type SlashItemCommandContext = {
    editor: Editor;
    range: Range;
    item: SlashCommandItem;
};
/**
 * If provided, run before default mention insertion. Return true to skip inserting a mention node.
 */
export type SlashOnItemCommand = (ctx: SlashItemCommandContext) => boolean;
/** Where the slash palette opens relative to the caret. */
export type SlashSuggestionPlacement = 'below' | 'above' | 'auto';
export type CreateSlashMentionExtensionOptions = {
    /** Items shown in the slash menu (filtered by query after `/`). */
    items: SlashCommandItem[];
    /** Trigger character; use `/` for slash commands. */
    slashChar?: string;
    /** Optional custom plugin key when multiple slash editors exist. */
    pluginKey?: import('@tiptap/pm/state').PluginKey;
    /** Custom handler (e.g. insert a block node instead of a mention). */
    onItemCommand?: SlashOnItemCommand;
    /**
     * Palette position vs caret. Default `below`.
     * Use `above` for bottom-anchored composers (chat prompt); `auto` flips by viewport space.
     */
    suggestionPlacement?: SlashSuggestionPlacement;
};
