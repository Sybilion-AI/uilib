import { Input } from '#uilib/components/ui/Input';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const VARIANTS = ['default', 'clean'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

export default function InputPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Input' }]}
        title="Input"
        subheader="Variants, sizes, textarea, placeholder, and disabled state."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Input is the standard single-line text field. Pair it with a Label linked via htmlFor and id, and control the value through the onChange handler."
        whenToUse={[
          'To collect short, free-form text such as names, titles, or search terms.',
          'In forms alongside Label, or use LabeledInput for the common label-plus-input row.',
        ]}
        whenNotToUse={[
          'For multi-line text; use Textarea instead.',
          'When the value must come from a fixed set of options; use Select or Combobox.',
        ]}
        doNotes={[
          'Always associate a visible Label so the field is announced correctly by assistive technology.',
          'Use placeholder text as a hint, not as a substitute for the label.',
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
                        <Input
                          variant={v}
                          size={s}
                          placeholder={`${v} ${s}`}
                          style={{ width: 200 }}
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
          <h3 style={{ marginBottom: '1rem' }}>Type variants</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>type="textarea"</code> for a multi-line field — same{' '}
            <code>size</code> and <code>variant</code> props apply.
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
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    textarea
                  </td>
                  {SIZES.map(s => (
                    <td key={s} style={{ padding: '0.5rem' }}>
                      <Input
                        type="textarea"
                        size={s}
                        placeholder={`textarea ${s}`}
                        rows={3}
                        style={{ width: 200 }}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Disabled</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {VARIANTS.map(v => (
              <Input
                key={v}
                variant={v}
                disabled
                placeholder={`Disabled ${v}`}
                style={{ width: 200 }}
              />
            ))}
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
