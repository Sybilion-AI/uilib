import { Input } from '#uilib/components/ui/Input';
import InputGuidance from '#uilib/components/ui/Input/AGENT.md';
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
        subheader="Variants, sizes, textarea, round, placeholder, and disabled state."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={InputGuidance} />
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
          <h3 style={{ marginBottom: '1rem' }}>Round</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>round</code> for pill corners (
            <code>border-radius: 100px</code>).
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {SIZES.map(s => (
              <Input
                key={s}
                size={s}
                round
                placeholder={`Round ${s}`}
                style={{ width: 200 }}
              />
            ))}
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
