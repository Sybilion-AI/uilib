const FENCE_OPEN = /```\s*json-dashboard\s*/i;

export function hasJsonDashboardFenceInText(text: string): boolean {
  return FENCE_OPEN.test(text);
}

/** Unescape literal `\n` sequences when the agent double-encodes newlines. */
export function normalizeJsonDashboardChatText(text: string): string {
  if (!text.includes('\\n')) return text;
  if (!FENCE_OPEN.test(text)) return text;
  // Real newlines mean the fence is already formatted; unescaping would
  // corrupt `\n` inside JSON string values (e.g. markdown code fences).
  if (text.includes('\n')) return text;
  return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

function findCompleteJsonEnd(text: string, contentStart: number): number {
  let lastValidEnd = -1;
  for (let i = contentStart + 1; i <= text.length; i++) {
    const candidate = text.slice(contentStart, i);
    if (!candidate.trim()) continue;
    try {
      JSON.parse(candidate);
      lastValidEnd = i;
    } catch {
      // keep extending until JSON is complete
    }
  }
  return lastValidEnd;
}

function findJsonDashboardContentEnd(
  text: string,
  contentStart: number,
): number {
  const jsonEnd = findCompleteJsonEnd(text, contentStart);
  if (jsonEnd < 0) return -1;

  const afterJson = text.slice(jsonEnd);
  const fenceIdx = afterJson.indexOf('```');
  if (fenceIdx >= 0) {
    return jsonEnd + fenceIdx;
  }

  const tail = text.slice(contentStart).trim();
  if (tail.length > 0) {
    try {
      JSON.parse(tail);
      return text.length;
    } catch {
      return jsonEnd;
    }
  }
  return jsonEnd;
}

export function jsonDashboardFenceBounds(
  text: string,
): { contentStart: number; contentEnd: number } | null {
  const prepared = normalizeJsonDashboardChatText(text);
  const startMatch = prepared.match(FENCE_OPEN);
  if (!startMatch || startMatch.index === undefined) return null;
  const contentStart = startMatch.index + startMatch[0].length;
  const contentEnd = findJsonDashboardContentEnd(prepared, contentStart);
  if (contentEnd < 0 || contentEnd <= contentStart) return null;
  return { contentStart, contentEnd };
}

function jsonDashboardFenceSpan(
  text: string,
): { start: number; end: number } | null {
  const prepared = normalizeJsonDashboardChatText(text);
  const startMatch = prepared.match(FENCE_OPEN);
  if (!startMatch || startMatch.index === undefined) return null;
  const contentStart = startMatch.index + startMatch[0].length;
  const closingFenceStart = findJsonDashboardContentEnd(prepared, contentStart);
  if (closingFenceStart < 0) {
    return { start: startMatch.index, end: prepared.length };
  }
  const end =
    closingFenceStart < prepared.length &&
    prepared.startsWith('```', closingFenceStart)
      ? closingFenceStart + 3
      : closingFenceStart;
  return { start: startMatch.index, end };
}

/** Removes fenced json-dashboard blocks (used before persisting chat messages). */
export function stripJsonDashboardFences(text: string): string {
  let result = normalizeJsonDashboardChatText(text);
  while (true) {
    const span = jsonDashboardFenceSpan(result);
    if (!span) break;
    result = result.slice(0, span.start) + result.slice(span.end);
  }
  result = result.replace(/\n{3,}/g, '\n\n');
  return result.trim();
}
