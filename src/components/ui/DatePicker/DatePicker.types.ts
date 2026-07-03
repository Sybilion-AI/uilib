import type { DateRangeValue, MonthView } from './dateUtils';

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerMode = 'single' | 'range';

export type CalendarProps = {
  className?: string;
  mode?: DatePickerMode;
  value?: string;
  rangeStart?: string;
  rangeEnd?: string;
  rangeHover?: string;
  viewMonth?: MonthView;
  onViewMonthChange?: (viewMonth: MonthView) => void;
  onSelect?: (value: string) => void;
  onDayHover?: (value: string | undefined) => void;
  startOfWeek?: 0 | 1;
  minDate?: string;
  maxDate?: string;
  disabledDate?: (date: string) => boolean;
  size?: DatePickerSize;
};

export type DatePickerProps = {
  className?: string;
  mode?: DatePickerMode;
  value?: string;
  onChange?: (value: string) => void;
  rangeValue?: DateRangeValue | null;
  onRangeChange?: (value: DateRangeValue | null) => void;
  size?: DatePickerSize;
  calendarProps?: Omit<
    CalendarProps,
    | 'value'
    | 'onSelect'
    | 'size'
    | 'mode'
    | 'rangeStart'
    | 'rangeEnd'
    | 'rangeHover'
    | 'onDayHover'
  >;
};

export type DateRangePickerInputProps = Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
> & {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onChange?: (value: DateRangeValue | null) => void;
  size?: DatePickerSize;
  variant?: 'default' | 'clean';
  startPlaceholder?: string;
  endPlaceholder?: string;
  minDate?: string;
  maxDate?: string;
  disabledDate?: (date: string) => boolean;
  calendarProps?: Omit<
    CalendarProps,
    | 'value'
    | 'onSelect'
    | 'size'
    | 'mode'
    | 'rangeStart'
    | 'rangeEnd'
    | 'rangeHover'
    | 'onDayHover'
  >;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DatePickerInputProps = Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  size?: DatePickerSize;
  variant?: 'default' | 'clean';
  placeholder?: string;
  displayFormat?: string;
  minDate?: string;
  maxDate?: string;
  disabledDate?: (date: string) => boolean;
  calendarProps?: Omit<CalendarProps, 'value' | 'onSelect' | 'size'>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
