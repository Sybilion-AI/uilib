import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#uilib/components/ui/Select';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const VARIANTS = ['default', 'clear'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'orange', label: 'Orange' },
  { value: 'banana', label: 'Banana' },
] as const;

function DemoSelect({
  variant,
  size,
  disabled = false,
  placeholder,
  defaultValue,
  darker = false,
}: {
  variant: (typeof VARIANTS)[number];
  size: (typeof SIZES)[number];
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string;
  darker?: boolean;
}) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger
        variant={variant}
        size={size}
        disabled={disabled}
        darker={darker}
        style={{ width: 200 }}
      >
        <SelectValue placeholder={placeholder ?? 'Pick fruit'} />
      </SelectTrigger>
      <SelectContent>
        {FRUIT_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function SelectPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Select' }]}
        title="Select"
        subheader="Variants, sizes, placeholder, darker trigger, and disabled state."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Select is a Radix-based dropdown for choosing a single option from a list. Compose it from Select, SelectTrigger, SelectValue, SelectContent, and SelectItem, and pick a trigger variant and size to match the surrounding controls."
        whenToUse={[
          'To choose one option from a list of roughly five or more items.',
          'In forms, toolbars, and filters where space is limited and options collapse behind a trigger.',
        ]}
        whenNotToUse={[
          'For two to four options that benefit from being visible at once; use ToggleGroup or radio buttons.',
          'For multi-select or searchable lists; use a combobox or multi-select component.',
        ]}
        doNotes={[
          'Use the clear variant for low-emphasis, inline selects embedded in text or toolbars.',
        ]}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Variants × sizes</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }} />
                  {SIZES.map(s => (
                    <th key={s} style={{ padding: '0.5rem' }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VARIANTS.map(v => (
                  <tr key={v}>
                    <td
                      style={{
                        padding: '0.5rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v}
                    </td>
                    {SIZES.map(s => (
                      <td key={s} style={{ padding: '0.5rem' }}>
                        <DemoSelect variant={v} size={s} defaultValue="apple" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Placeholder</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            No <code>defaultValue</code> — the trigger shows the placeholder
            until a value is chosen.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }} />
                  {SIZES.map(s => (
                    <th key={s} style={{ padding: '0.5rem' }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VARIANTS.map(v => (
                  <tr key={v}>
                    <td
                      style={{
                        padding: '0.5rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v}
                    </td>
                    {SIZES.map(s => (
                      <td key={s} style={{ padding: '0.5rem' }}>
                        <DemoSelect
                          variant={v}
                          size={s}
                          placeholder="Pick fruit"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Darker trigger</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>darker</code> on <code>SelectTrigger</code> for a
            higher-contrast background.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              backgroundColor: 'var(--background)',
              padding: '0.75rem',
              borderRadius: 'var(--p-3)',
            }}
          >
            {SIZES.map(s => (
              <DemoSelect
                key={s}
                variant="default"
                size={s}
                defaultValue="orange"
                darker
              />
            ))}
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Disabled</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }} />
                  {SIZES.map(s => (
                    <th key={s} style={{ padding: '0.5rem' }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VARIANTS.map(v => (
                  <tr key={v}>
                    <td
                      style={{
                        padding: '0.5rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v}
                    </td>
                    {SIZES.map(s => (
                      <td key={s} style={{ padding: '0.5rem' }}>
                        <DemoSelect
                          variant={v}
                          size={s}
                          defaultValue="banana"
                          disabled
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
