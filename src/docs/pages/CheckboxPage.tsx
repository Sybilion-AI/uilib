import { Checkbox } from '#uilib/components/ui/Checkbox';
import CheckboxGuidance from '#uilib/components/ui/Checkbox/AGENT.md';
import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const SIZES = ['sm', 'md', 'lg'] as const;

const STATES = [
  { label: 'unchecked', checked: false },
  { label: 'checked', checked: true },
] as const;

export default function CheckboxPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Checkbox' }]}
        title="Checkbox"
        subheader="Sizes, checked/unchecked states, and disabled state."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={CheckboxGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>States × sizes</h3>
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
                {STATES.map(st => (
                  <tr key={st.label}>
                    <td
                      style={{
                        padding: '0.5rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.label}
                    </td>
                    {SIZES.map(s => (
                      <td key={s} style={{ padding: '0.5rem' }}>
                        <Checkbox
                          id={`cb-${st.label}-${s}`}
                          size={s}
                          checked={st.checked}
                          aria-label={`${st.label} ${s}`}
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
          <h3 style={{ marginBottom: '1rem' }}>With label</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            {SIZES.map(s => (
              <div
                key={s}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Checkbox id={`cb-label-${s}`} size={s} defaultChecked />
                <Label htmlFor={`cb-label-${s}`}>{s}</Label>
              </div>
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
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    unchecked
                  </td>
                  {SIZES.map(s => (
                    <td key={s} style={{ padding: '0.5rem' }}>
                      <Checkbox
                        size={s}
                        disabled
                        aria-label={`Disabled unchecked ${s}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    checked
                  </td>
                  {SIZES.map(s => (
                    <td key={s} style={{ padding: '0.5rem' }}>
                      <Checkbox
                        size={s}
                        checked
                        disabled
                        aria-label={`Disabled checked ${s}`}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
