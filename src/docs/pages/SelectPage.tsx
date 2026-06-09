import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#uilib/components/ui/Select';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const VARIANTS = ['default', 'clear'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'orange', label: 'Orange' },
  { value: 'banana', label: 'Banana' },
] as const;

function DemoSelect({
  variant,
  size,
}: {
  variant: (typeof VARIANTS)[number];
  size: (typeof SIZES)[number];
}) {
  return (
    <Select defaultValue="apple">
      <SelectTrigger variant={variant} size={size} style={{ width: 200 }}>
        <SelectValue placeholder="Pick fruit" />
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
        subheader="Radix select — variants and sizes."
        actions={<DocsHeaderActions />}
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
                        <DemoSelect variant={v} size={s} />
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
