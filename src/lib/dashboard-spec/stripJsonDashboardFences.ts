const FENCE_STRIP = /```json-dashboard\s*[\s\S]*?```/gi;

/** Removes fenced json-dashboard blocks (used before persisting chat messages). */
export function stripJsonDashboardFences(text: string): string {
  return text.replace(FENCE_STRIP, '').trim();
}
