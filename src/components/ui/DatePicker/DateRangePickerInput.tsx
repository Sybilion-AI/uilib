import cn from 'classnames';
import { useCallback, useId, useState } from 'react';

import { CalendarBlank } from '@phosphor-icons/react';

import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { Input } from '../Input';
import { DatePicker } from './DatePicker';
import S from './DatePicker.styl';
import type { DateRangePickerInputProps } from './DatePicker.types';
import {
  type DateRangeValue,
  formatDateString,
  formatDisplayDateRange,
  normalizeDateRange,
  parseDateString,
} from './dateUtils';

function commitRangeField(
  current: DateRangeValue | null | undefined,
  field: 'start' | 'end',
  nextValue: string | undefined,
): DateRangeValue | null {
  const next = {
    start: current?.start ?? '',
    end: current?.end ?? '',
    [field]: nextValue ?? '',
  };

  if (!next.start && !next.end) {
    return null;
  }
  if (next.start && next.end) {
    return normalizeDateRange(next.start, next.end);
  }
  return next;
}

export function DateRangePickerInput({
  className,
  value: controlledValue,
  defaultValue,
  onChange,
  size = 'md',
  startPlaceholder = 'Start date',
  endPlaceholder = 'End date',
  disabled,
  minDate,
  maxDate,
  disabledDate,
  calendarProps,
  open: controlledOpen,
  onOpenChange,
  id: idProp,
  variant = 'default',
  ...inputProps
}: DateRangePickerInputProps) {
  const generatedId = useId();
  const startId = idProp ?? `${generatedId}-start`;
  const endId = `${startId}-end`;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<string | undefined>();
  const [draftEnd, setDraftEnd] = useState<string | undefined>();
  const [focusedField, setFocusedField] = useState<'start' | 'end' | null>(
    null,
  );

  const value = controlledValue ?? uncontrolledValue;
  const open = controlledOpen ?? uncontrolledOpen;

  // Calendar picks end once start is set; otherwise start (Carbon-style).
  const calendarActiveField: 'start' | 'end' =
    value?.start && !value?.end ? 'end' : 'start';
  const activeField = focusedField ?? (open ? calendarActiveField : null);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const commitValue = useCallback(
    (nextValue: DateRangeValue | null) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [controlledValue, onChange],
  );

  const handleStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setDraftStart(nextValue);
      if (!nextValue) {
        commitValue(commitRangeField(value, 'start', undefined));
        return;
      }
      if (parseDateString(nextValue)) {
        commitValue(commitRangeField(value, 'start', nextValue));
      }
    },
    [commitValue, value],
  );

  const handleEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setDraftEnd(nextValue);
      if (!nextValue) {
        commitValue(commitRangeField(value, 'end', undefined));
        return;
      }
      if (parseDateString(nextValue)) {
        commitValue(commitRangeField(value, 'end', nextValue));
      }
    },
    [commitValue, value],
  );

  const handleStartBlur = useCallback(() => {
    if (draftStart === undefined) {
      return;
    }
    const parsed = parseDateString(draftStart);
    if (parsed) {
      commitValue(commitRangeField(value, 'start', formatDateString(parsed)));
    } else if (!draftStart) {
      commitValue(commitRangeField(value, 'start', undefined));
    }
    setDraftStart(undefined);
  }, [commitValue, draftStart, value]);

  const handleEndBlur = useCallback(() => {
    if (draftEnd === undefined) {
      return;
    }
    const parsed = parseDateString(draftEnd);
    if (parsed) {
      commitValue(commitRangeField(value, 'end', formatDateString(parsed)));
    } else if (!draftEnd) {
      commitValue(commitRangeField(value, 'end', undefined));
    }
    setDraftEnd(undefined);
  }, [commitValue, draftEnd, value]);

  const handleRangeSelect = useCallback(
    (nextValue: DateRangeValue | null) => {
      commitValue(nextValue);
      if (nextValue?.start && nextValue?.end) {
        setDraftStart(undefined);
        setDraftEnd(undefined);
        setOpen(false);
      }
    },
    [commitValue, setOpen],
  );

  const startDisplay =
    draftStart !== undefined ? draftStart : (value?.start ?? '');
  const endDisplay = draftEnd !== undefined ? draftEnd : (value?.end ?? '');

  return (
    <div
      className={cn(S.rangeInputRoot, S[`inputSize-${size}`], className)}
      data-slot="date-range-picker-input"
    >
      <Input
        {...inputProps}
        type="text"
        variant={variant}
        id={startId}
        size={size}
        value={startDisplay}
        placeholder={startPlaceholder}
        disabled={disabled}
        onChange={handleStartChange}
        onBlur={() => {
          handleStartBlur();
          setFocusedField(current => (current === 'start' ? null : current));
        }}
        onFocus={() => {
          setFocusedField('start');
          setOpen(true);
        }}
        className={cn(
          S.inputField,
          S.rangeInputField,
          activeField === 'start' && S.rangeInputFieldActive,
        )}
        autoComplete="off"
        inputMode="numeric"
        aria-label="Start date"
      />
      <span className={S.rangeSeparator} aria-hidden="true">
        –
      </span>
      <Input
        {...inputProps}
        type="text"
        variant={variant}
        id={endId}
        size={size}
        value={endDisplay}
        placeholder={endPlaceholder}
        disabled={disabled}
        onChange={handleEndChange}
        onBlur={() => {
          handleEndBlur();
          setFocusedField(current => (current === 'end' ? null : current));
        }}
        onFocus={() => {
          setFocusedField('end');
          setOpen(true);
        }}
        className={cn(
          S.inputField,
          S.rangeInputField,
          activeField === 'end' && S.rangeInputFieldActive,
        )}
        autoComplete="off"
        inputMode="numeric"
        aria-label="End date"
      />
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon
            disabled={disabled}
            className={S.rangeCalendarTrigger}
            aria-label="Open calendar"
            onClick={() => setOpen(true)}
          >
            <CalendarBlank size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className={cn(S.popupContent, size === 'sm' && S['popupContent-sm'])}
          onCloseAutoFocus={event => event.preventDefault()}
        >
          <DatePicker
            mode="range"
            rangeValue={value}
            onRangeChange={handleRangeSelect}
            size={size}
            calendarProps={{
              minDate,
              maxDate,
              disabledDate,
              ...calendarProps,
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <span className={S.srOnly} aria-live="polite">
        {formatDisplayDateRange(value)}
      </span>
    </div>
  );
}
