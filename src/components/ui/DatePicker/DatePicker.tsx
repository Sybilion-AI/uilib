import cn from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CaretLeft, CaretRight } from '@phosphor-icons/react';

import { Button } from '../Button';
import { Calendar } from './Calendar';
import S from './DatePicker.styl';
import type { DatePickerProps } from './DatePicker.types';
import {
  addMonths,
  formatMonthYear,
  getTodayParts,
  normalizeDateRange,
  parseDateString,
} from './dateUtils';

export function DatePicker({
  className,
  mode = 'single',
  value,
  onChange,
  rangeValue,
  onRangeChange,
  size = 'md',
  calendarProps,
}: DatePickerProps) {
  const selected = parseDateString(value);
  const rangeStartParsed = parseDateString(rangeValue?.start);
  const today = getTodayParts();
  const [viewMonth, setViewMonth] = useState(() => ({
    year:
      selected?.year ??
      rangeStartParsed?.year ??
      parseDateString(rangeValue?.end)?.year ??
      today.year,
    month:
      selected?.month ??
      rangeStartParsed?.month ??
      parseDateString(rangeValue?.end)?.month ??
      today.month,
  }));
  const [pendingStart, setPendingStart] = useState<string | undefined>();
  const [rangeHover, setRangeHover] = useState<string | undefined>();

  useEffect(() => {
    const parsed = parseDateString(value);
    if (parsed) {
      setViewMonth({ year: parsed.year, month: parsed.month });
    }
  }, [value]);

  useEffect(() => {
    const parsed =
      parseDateString(rangeValue?.start) ?? parseDateString(rangeValue?.end);
    if (parsed) {
      setViewMonth({ year: parsed.year, month: parsed.month });
    }
  }, [rangeValue?.end, rangeValue?.start]);

  useEffect(() => {
    if (rangeValue?.start && rangeValue?.end) {
      setPendingStart(undefined);
      setRangeHover(undefined);
    }
  }, [rangeValue?.end, rangeValue?.start]);

  const monthLabel = useMemo(
    () => formatMonthYear(viewMonth.year, viewMonth.month),
    [viewMonth.month, viewMonth.year],
  );

  const handlePrevMonth = useCallback(() => {
    setViewMonth(current => addMonths(current, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth(current => addMonths(current, 1));
  }, []);

  const handleSelect = useCallback(
    (nextValue: string) => {
      if (mode === 'single') {
        onChange?.(nextValue);
        return;
      }

      const hasCompleteRange = Boolean(rangeValue?.start && rangeValue?.end);
      const activeStart = pendingStart ?? rangeValue?.start;

      if (!activeStart || hasCompleteRange) {
        setPendingStart(nextValue);
        setRangeHover(undefined);
        onRangeChange?.({ start: nextValue, end: '' });
        return;
      }

      const normalized = normalizeDateRange(activeStart, nextValue);
      setPendingStart(undefined);
      setRangeHover(undefined);
      onRangeChange?.(normalized);
    },
    [
      mode,
      onChange,
      onRangeChange,
      pendingStart,
      rangeValue?.end,
      rangeValue?.start,
    ],
  );

  const activeRangeStart = pendingStart ?? rangeValue?.start;
  const activeRangeEnd = rangeValue?.end;

  return (
    <div
      className={cn(S.picker, S[`pickerSize-${size}`], className)}
      data-slot="date-picker"
      data-mode={mode}
    >
      <div className={S.pickerHeader}>
        <Button
          type="button"
          variant="ghost"
          size={size}
          icon
          aria-label="Previous month"
          onClick={handlePrevMonth}
        >
          <CaretLeft size={16} />
        </Button>
        <div className={S.pickerMonthLabel}>{monthLabel}</div>
        <Button
          type="button"
          variant="ghost"
          size={size}
          icon
          aria-label="Next month"
          onClick={handleNextMonth}
        >
          <CaretRight size={16} />
        </Button>
      </div>
      <Calendar
        mode={mode}
        value={value}
        rangeStart={activeRangeStart}
        rangeEnd={activeRangeEnd}
        rangeHover={rangeHover}
        onDayHover={setRangeHover}
        viewMonth={viewMonth}
        onViewMonthChange={setViewMonth}
        onSelect={handleSelect}
        size={size}
        {...calendarProps}
      />
    </div>
  );
}
