import type { SlashCommandItem } from './types';
/** Empty default: pass `slashCommandItems` from the app to enable `/` palette. */
export declare const DEFAULT_CHAT_SLASH_ITEMS: SlashCommandItem[];
export declare function filterSlashItems(items: SlashCommandItem[], query: string): SlashCommandItem[];
