export type DateParts = {
  year: number;
  month: number;
  day: number;
};

export type MonthView = Pick<DateParts, 'year' | 'month'>;

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateString(
  value: string | undefined | null,
): DateParts | null {
  if (!value) {
    return null;
  }
  const match = ISO_DATE_RE.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function formatDateString(parts: DateParts): string {
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${parts.year}-${month}-${day}`;
}

export function toUtcTimestamp(parts: DateParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

export function isSameDate(a: DateParts, b: DateParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isBeforeDate(a: DateParts, b: DateParts): boolean {
  return toUtcTimestamp(a) < toUtcTimestamp(b);
}

export function isAfterDate(a: DateParts, b: DateParts): boolean {
  return toUtcTimestamp(a) > toUtcTimestamp(b);
}

export function addMonths(parts: MonthView, delta: number): MonthView {
  const date = new Date(Date.UTC(parts.year, parts.month - 1 + delta, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

export function getTodayParts(): DateParts {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function getMonthMatrix(
  year: number,
  month: number,
  startOfWeek: 0 | 1,
): DateParts[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = firstOfMonth.getUTCDay();
  const offset = (firstWeekday - startOfWeek + 7) % 7;
  const start = new Date(Date.UTC(year, month - 1, 1 - offset));
  const days: DateParts[] = [];

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start.getTime() + i * 86_400_000);
    days.push({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    });
  }

  return days;
}

export function formatDisplayDate(
  value: string | undefined,
  locale = 'en-US',
): string {
  const parts = parseDateString(value);
  if (!parts) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(parts.year, parts.month - 1, parts.day));
}

export function formatMonthYear(
  year: number,
  month: number,
  locale = 'en-US',
): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

export function getWeekdayLabels(
  startOfWeek: 0 | 1,
  locale = 'en-US',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const baseSunday = new Date(2024, 0, 7);
  const labels: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const weekday = (startOfWeek + i) % 7;
    const date = new Date(baseSunday);
    date.setDate(baseSunday.getDate() + weekday);
    labels.push(formatter.format(date));
  }
  return labels;
}

export type DateRangeValue = {
  start: string;
  end: string;
};

export function normalizeDateRange(start: string, end: string): DateRangeValue {
  const startParts = parseDateString(start);
  const endParts = parseDateString(end);
  if (!startParts || !endParts) {
    return { start, end };
  }
  if (isAfterDate(startParts, endParts)) {
    return { start: end, end: start };
  }
  return { start, end };
}

export function isBetweenDates(
  parts: DateParts,
  start: DateParts,
  end: DateParts,
): boolean {
  const timestamp = toUtcTimestamp(parts);
  return timestamp >= toUtcTimestamp(start) && timestamp <= toUtcTimestamp(end);
}

export function formatDisplayDateRange(
  value: DateRangeValue | null | undefined,
  locale = 'en-US',
): string {
  if (!value?.start || !value?.end) {
    return '';
  }
  const start = formatDisplayDate(value.start, locale);
  const end = formatDisplayDate(value.end, locale);
  return `${start} – ${end}`;
}

export function isDateDisabled(
  parts: DateParts,
  options: {
    minDate?: string;
    maxDate?: string;
    disabledDate?: (date: string) => boolean;
  },
): boolean {
  const { minDate, maxDate, disabledDate } = options;
  const min = parseDateString(minDate);
  const max = parseDateString(maxDate);

  if (min && isBeforeDate(parts, min)) {
    return true;
  }
  if (max && isAfterDate(parts, max)) {
    return true;
  }
  if (disabledDate?.(formatDateString(parts))) {
    return true;
  }
  return false;
}
