DatePickerInput is the primary date field for forms: a text input with a calendar icon that opens a month grid for single-date selection. DateRangePickerInput adds start/end fields with shared calendar range selection (Carbon-style). Values use ISO `YYYY-MM-DD`; pair with Label for accessible forms.

## When to use

- `DatePickerInput` — one calendar date in a form or filter.
- `DateRangePickerInput` — a start/end interval (reporting windows, booking spans, filter ranges).
- When users benefit from both typed entry and a visual month picker.

## When not to use

- For time-of-day selection; combine with a time input.
- For relative dates ("in 3 days"); use Select or dedicated controls.

## Do

- Pass `minDate`, `maxDate`, or `disabledDate` to constrain selectable days.
- Use `calendarProps.startOfWeek` when the locale starts weeks on Monday (`1`).
- Label range fields clearly (start/end placeholders or visible Labels).

## Don't

- Use placeholder text as the only label; associate visible Labels via `id` / `htmlFor`.
- Use single `DatePickerInput` for intervals; use `DateRangePickerInput` instead.

## Range selection UX

- First calendar click sets start; second click sets end (auto-swaps if end is before start).
- Hover previews the tentative range before the second click.
- Calendar closes when both dates are selected.
- Each text field accepts manual ISO entry independently.

## API

```tsx
import { DateRangePickerInput, type DateRangeValue } from '@sybilion/uilib';

const [range, setRange] = useState<DateRangeValue | null>({
  start: '2026-07-01',
  end: '2026-07-31',
});

<DateRangePickerInput value={range} onChange={setRange} />
```

Low-level calendar: `<DatePicker mode="range" rangeValue={range} onRangeChange={setRange} />`.
