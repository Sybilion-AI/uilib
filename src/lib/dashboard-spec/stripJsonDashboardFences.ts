const FENCE_OPEN = /```json-dashboard\s*/i;
const FENCE_STRIP_CLOSED = /```json-dashboard\s*[\s\S]*?```/gi;

/** Removes fenced json-dashboard blocks (used before persisting chat messages). */
export function stripJsonDashboardFences(text: string): string {
  let result = text.replace(FENCE_STRIP_CLOSED, '');
  const openMatch = result.match(FENCE_OPEN);
  if (openMatch?.index != null) {
    result = result.slice(0, openMatch.index);
  }
  result = result.replace(/\n{3,}/g, '\n\n');
  return result.trim();
}
