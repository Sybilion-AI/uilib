/**
 * Sort items by updated_at (newest first), return up to N latest.
 * Falls back to original order when updated_at is missing.
 */
export const getLatestByUpdatedAt = <T extends { updated_at?: string }>(
  items: T[],
  count: number,
): T[] => {
  const withTs = items.map(item => ({
    item,
    ts: item.updated_at ? new Date(item.updated_at).getTime() : 0,
  }));
  return withTs
    .sort((a, b) => b.ts - a.ts)
    .slice(0, count)
    .map(({ item }) => item);
};
