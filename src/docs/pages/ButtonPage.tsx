import { Button } from '#uilib/components/ui/Button';
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
      <DocsGuidance
        overview="Buttons trigger an action or event, such as submitting a form or confirming a dialog. Choose a variant that matches the weight of the action: default for the primary action, secondary or outline for supporting actions, ghost for low-emphasis actions, and destructive for irreversible ones."
        whenToUse={[
          'To trigger an immediate action, such as saving, submitting, or confirming.',
          'To open a dialog, drawer, or other transient surface.',
          'As the primary call to action in a form, card, or empty state.',
        ]}
        whenNotToUse={[
          'To navigate to another page; use a link or the link variant instead.',
          'To switch between mutually exclusive options; use Tabs, Toggle, or ToggleGroup.',
        ]}
        doNotes={[
          'Use one default-variant button per view so the primary action stays clear.',
          'Label buttons with a verb that describes the action, such as “Save changes”.',
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
