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
import type { DatePickerInputProps } from './DatePicker.types';
import {
  formatDateString,
  formatDisplayDate,
  parseDateString,
} from './dateUtils';

export function DatePickerInput({
  className,
  value: controlledValue,
  defaultValue,
  onChange,
  size = 'md',
  placeholder = 'YYYY-MM-DD',
  disabled,
  minDate,
  maxDate,
  disabledDate,
  calendarProps,
  open: controlledOpen,
  onOpenChange,
  id: idProp,
  displayFormat: _displayFormat,
  variant = 'default',
  ...inputProps
}: DatePickerInputProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [draftValue, setDraftValue] = useState<string | undefined>();

  const value = controlledValue ?? uncontrolledValue;
  const open = controlledOpen ?? uncontrolledOpen;

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
    (nextValue: string | undefined) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [controlledValue, onChange],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setDraftValue(nextValue);
      if (!nextValue) {
        commitValue(undefined);
        return;
      }
      if (parseDateString(nextValue)) {
        commitValue(nextValue);
      }
    },
    [commitValue],
  );

  const handleInputBlur = useCallback(() => {
    if (draftValue === undefined) {
      return;
    }
    const parsed = parseDateString(draftValue);
    if (parsed) {
      commitValue(formatDateString(parsed));
    } else if (!draftValue) {
      commitValue(undefined);
    }
    setDraftValue(undefined);
  }, [commitValue, draftValue]);

  const handleDateSelect = useCallback(
    (nextValue: string) => {
      commitValue(nextValue);
      setDraftValue(undefined);
      setOpen(false);
    },
    [commitValue, setOpen],
  );

  const displayValue = draftValue !== undefined ? draftValue : (value ?? '');

  return (
    <div
      className={cn(S.inputRoot, S[`inputSize-${size}`], className)}
      data-slot="date-picker-input"
    >
      <Input
        {...inputProps}
        type="text"
        variant={variant}
        id={inputId}
        size={size}
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => setOpen(true)}
        className={S.inputField}
        autoComplete="off"
        inputMode="numeric"
      />
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon
            disabled={disabled}
            className={S.calendarTrigger}
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
            value={value}
            onChange={handleDateSelect}
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
        {value ? formatDisplayDate(value) : ''}
      </span>
    </div>
  );
}
