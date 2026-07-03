import { useState } from 'react';

import {
  DatePickerInput,
  DateRangePickerInput,
} from '#uilib/components/ui/DatePicker';
import type { DateRangeValue } from '#uilib/components/ui/DatePicker';
import datePickerGuidance from '#uilib/components/ui/DatePicker/AGENT.md';
import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const SIZES = ['sm', 'md', 'lg'] as const;
const FIELD_WIDTH = 240;
const RANGE_FIELD_WIDTH = 360;

export default function DatePickerPage() {
  const [value, setValue] = useState('2026-07-03');
  const [emptyValue, setEmptyValue] = useState<string | undefined>();
  const [rangeValue, setRangeValue] = useState<DateRangeValue | null>({
    start: '2026-07-01',
    end: '2026-07-15',
  });
  const [emptyRange, setEmptyRange] = useState<DateRangeValue | null>(null);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'DatePicker' }]}
        title="DatePicker"
        subheader="Single-date and range inputs with calendar popup, sizes, and constraints."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={datePickerGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Sizes</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            {SIZES.map(size => (
              <div key={size}>
                <Label htmlFor={`date-picker-${size}`}>{size}</Label>
                <DatePickerInput
                  id={`date-picker-${size}`}
                  size={size}
                  value={value}
                  onChange={next => setValue(next ?? '')}
                  style={{ width: FIELD_WIDTH }}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Placeholder</h3>
          <DatePickerInput
            value={emptyValue}
            onChange={setEmptyValue}
            placeholder="Select a date"
            style={{ width: FIELD_WIDTH }}
          />
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Min / max dates</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Only dates between 2026-07-01 and 2026-07-31 are selectable.
          </p>
          <DatePickerInput
            value={value}
            onChange={next => setValue(next ?? '')}
            minDate="2026-07-01"
            maxDate="2026-07-31"
            style={{ width: FIELD_WIDTH }}
          />
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Week starts Monday</h3>
          <DatePickerInput
            value={value}
            onChange={next => setValue(next ?? '')}
            calendarProps={{ startOfWeek: 1 }}
            style={{ width: FIELD_WIDTH }}
          />
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Date range</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Click a start date, then an end date. The active field is outlined
            while you pick; hover previews the interval before the second click.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <Label htmlFor="date-range-default">Default range</Label>
              <DateRangePickerInput
                id="date-range-default"
                value={rangeValue}
                onChange={setRangeValue}
                style={{ width: RANGE_FIELD_WIDTH }}
              />
            </div>
            <div>
              <Label htmlFor="date-range-empty">Empty range</Label>
              <DateRangePickerInput
                id="date-range-empty"
                value={emptyRange}
                onChange={setEmptyRange}
                startPlaceholder="From"
                endPlaceholder="To"
                style={{ width: RANGE_FIELD_WIDTH }}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Range sizes</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            {SIZES.map(size => (
              <div key={size}>
                <Label htmlFor={`date-range-${size}`}>{size}</Label>
                <DateRangePickerInput
                  id={`date-range-${size}`}
                  size={size}
                  value={rangeValue}
                  onChange={setRangeValue}
                  style={{ width: RANGE_FIELD_WIDTH }}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Disabled</h3>
          <DatePickerInput
            value="2026-07-03"
            disabled
            style={{ width: FIELD_WIDTH }}
          />
        </section>
      </PageContentSection>
    </>
  );
}
