import type { UTCTimestamp } from 'lightweight-charts';

/**
 * Parse `YYYY-MM-DD` dates as UTC midnight → Lightweight Charts unix seconds.
 */
export function chartDateToUtcTimestamp(dateStr: string): UTCTimestamp {
  const trimmed = dateStr.slice(0, 10);
  const [y, m, d] = trimmed.split('-').map(Number);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d) ||
    trimmed.length !== 10
  ) {
    return Math.floor(new Date(dateStr).getTime() / 1000) as UTCTimestamp;
  }
  return Math.floor(Date.UTC(y, m - 1, d, 0, 0, 0, 0) / 1000) as UTCTimestamp;
}
