import { Button } from '#uilib/components/ui/Button';
import ButtonGuidance from '#uilib/components/ui/Button/AGENT.md';
import type { ButtonVariant } from '#uilib/components/ui/Button/Button.types';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Plus } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const VARIANTS: ButtonVariant[] = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
];

const SIZES = ['sm', 'md', 'lg'] as const;

export default function ButtonPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Button' }]}
        title="Button"
        subheader="Variants, sizes, icon mode, and disabled state."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={ButtonGuidance} />
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
                        <Button type="button" variant={v} size={s}>
                          {v}
                        </Button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Icon buttons</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Square icon buttons — <code>icon</code> prop; pair with{' '}
            <code>size</code> for sm / md / lg.
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
              <Button
                key={s}
                type="button"
                variant="default"
                size={s}
                icon
                aria-label={`Add ${s}`}
              >
                <Plus size={20} />
              </Button>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              marginTop: '0.75rem',
            }}
          >
            {VARIANTS.map(v => (
              <Button key={v} type="button" variant={v} icon aria-label={v}>
                <Plus size={20} />
              </Button>
            ))}
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Disabled</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Button type="button" disabled>
              Disabled
            </Button>
            <Button type="button" variant="outline" disabled>
              Disabled outline
            </Button>
            <Button
              type="button"
              variant="ghost"
              icon
              disabled
              aria-label="Disabled icon"
            >
              <Plus size={20} />
            </Button>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
