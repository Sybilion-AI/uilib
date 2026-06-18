import type { CSSProperties } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsVariant,
} from '#uilib/components/ui/Tabs';
import tabsGuidance from '#uilib/docs/agent-guidance/tabs.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const VARIANTS: TabsVariant[] = ['button', 'link', 'outline'];
const SIZES = ['sm', 'md', 'lg'] as const;

const OUTLINE_DEMO_TABS = [
  { value: 'crude-oil', label: 'Crude Oil', pct: 15 },
  { value: 'consumer-staples', label: 'Consumer Staples Euro', pct: 15 },
  { value: 'energy', label: 'Energy', pct: 8 },
  { value: 'metals', label: 'Metals', pct: 12 },
  { value: 'agriculture', label: 'Agriculture', pct: 5 },
] as const;

function OutlineTabLabel({ label, pct }: { label: string; pct: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--p-2)',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          color: 'var(--destructive)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        ↘ {pct}%
      </span>
    </span>
  );
}

function TabsDemoCell({
  variant,
  size,
}: {
  variant: TabsVariant;
  size: (typeof SIZES)[number];
}) {
  const id = `${variant}-${size}`;
  return (
    <Tabs
      variant={variant}
      size={size}
      defaultValue={`${id}-a`}
      style={{ maxWidth: 360 }}
    >
      <TabsList>
        <TabsTrigger value={`${id}-a`}>Alpha</TabsTrigger>
        <TabsTrigger value={`${id}-b`}>Beta</TabsTrigger>
      </TabsList>
      <TabsContent value={`${id}-a`}>
        Panel A ({variant}, {size}).
      </TabsContent>
      <TabsContent value={`${id}-b`}>
        Panel B ({variant}, {size}).
      </TabsContent>
    </Tabs>
  );
}

export default function TabsPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Tabs' }]}
        title="Tabs"
        subheader="Variants, sizes, full-width list, darker surface."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={tabsGuidance} />
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
                        verticalAlign: 'top',
                      }}
                    >
                      {v}
                    </td>
                    {SIZES.map(s => (
                      <td key={s} style={{ padding: '0.5rem' }}>
                        <TabsDemoCell variant={v} size={s} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Outline</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            White pill triggers; active tab uses a border via{' '}
            <code>--selected-tab-outline-color</code> (defaults to{' '}
            <code>--sb-cyan-400</code>).
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              padding: '1rem',
              borderRadius: 'var(--p-3)',
              backgroundColor: 'var(--muted)',
            }}
          >
            <Tabs variant="outline" defaultValue={OUTLINE_DEMO_TABS[0].value}>
              <TabsList>
                {OUTLINE_DEMO_TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    <OutlineTabLabel label={tab.label} pct={tab.pct} />
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Tabs
              variant="outline"
              defaultValue="custom-a"
              style={
                {
                  '--selected-tab-outline-color': 'oklch(0.55 0.2 250)',
                } as CSSProperties
              }
            >
              <TabsList>
                <TabsTrigger value="custom-a">Custom outline</TabsTrigger>
                <TabsTrigger value="custom-b">Second tab</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Darker</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>darker</code> on root and/or list for muted segment
            background on inactive triggers.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              backgroundColor: 'var(--background)',
              padding: '1rem',
              borderRadius: 'var(--p-3)',
              width: '200px',
            }}
          >
            <Tabs defaultValue="dk-a" variant="button" darker>
              <TabsList darker>
                <TabsTrigger value="dk-a">One</TabsTrigger>
                <TabsTrigger value="dk-b">Two</TabsTrigger>
              </TabsList>
              <TabsContent value="dk-a">Button tabs + darker.</TabsContent>
              <TabsContent value="dk-b">Second tab.</TabsContent>
            </Tabs>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
