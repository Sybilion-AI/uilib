import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#uilib/components/ui/Tabs';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const VARIANTS = ['button', 'link'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

function TabsDemoCell({
  variant,
  size,
}: {
  variant: (typeof VARIANTS)[number];
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
