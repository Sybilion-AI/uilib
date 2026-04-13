const FENCE_STRIP = /```json-dashboard\s*[\s\S]*?```/gi;
/** Removes fenced json-dashboard blocks (used before persisting chat messages). */
function stripJsonDashboardFences(text) {
    return text.replace(FENCE_STRIP, '').trim();
}

export { stripJsonDashboardFences };
