/** Empty default: pass `slashCommandItems` from the app to enable `/` palette. */
const DEFAULT_CHAT_SLASH_ITEMS = [];
function filterSlashItems(items, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return items;
    return items.filter(item => item.id.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false));
}

export { DEFAULT_CHAT_SLASH_ITEMS, filterSlashItems };
