import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';
import SwitchGuidance from '#uilib/components/ui/Switch/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const SIZES = ['sm', 'md', 'lg'] as const;

const STATES = [
  { label: 'off', checked: false },
  { label: 'on', checked: true },
] as const;

export default function SwitchPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Switch' }]}
        title="Switch"
        subheader="Sizes, on/off states, and disabled state."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={SwitchGuidance} />
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
                        <Switch
                          id={`sw-${st.label}-${s}`}
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
                <Switch id={`sw-label-${s}`} size={s} defaultChecked />
                <Label htmlFor={`sw-label-${s}`}>{s}</Label>
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
                    off
                  </td>
                  {SIZES.map(s => (
                    <td key={s} style={{ padding: '0.5rem' }}>
                      <Switch
                        size={s}
                        disabled
                        aria-label={`Disabled off ${s}`}
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
                    on
                  </td>
                  {SIZES.map(s => (
                    <td key={s} style={{ padding: '0.5rem' }}>
                      <Switch
                        size={s}
                        checked
                        disabled
                        aria-label={`Disabled on ${s}`}
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
