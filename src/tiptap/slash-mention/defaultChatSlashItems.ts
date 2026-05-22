import type { SlashCommandItem } from './types';

/** Empty default: pass `slashCommandItems` from the app to enable `/` palette. */
export const DEFAULT_CHAT_SLASH_ITEMS: SlashCommandItem[] = [];

export function filterSlashItems(
  items: SlashCommandItem[],
  query: string,
): SlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    item =>
      item.id.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false),
  );
}
