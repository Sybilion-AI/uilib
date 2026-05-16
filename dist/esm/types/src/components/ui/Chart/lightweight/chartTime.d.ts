import type { UTCTimestamp } from 'lightweight-charts';
/**
 * Parse `YYYY-MM-DD` dates as UTC midnight → Lightweight Charts unix seconds.
 */
export declare function chartDateToUtcTimestamp(dateStr: string): UTCTimestamp;
