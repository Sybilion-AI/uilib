import type { CSSProperties } from 'react';

import GridLayoutGuidance from '#uilib/components/ui/GridLayout/AGENT.md';
import { GridLayout } from '#uilib/components/ui/GridLayout/GridLayout';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const tileStyle: CSSProperties = {
  margin: 0,
  padding: 'var(--p-4)',
  borderRadius: 'var(--p-3)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--muted)',
};

function Tile({ label }: { label: string }) {
  return <p style={tileStyle}>{label}</p>;
}

export default function GridLayoutPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'GridLayout' }]}
        title="GridLayout"
        subheader="Responsive CSS grid (`repeat(auto-fit, minmax(colWidth, 1fr))`), optional gap, polymorphic root via `as`."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={GridLayoutGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '0.75rem' }}>Default (colWidth 300)</h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Tiles wrap to new rows when the viewport is narrow; each cell keeps
            at least 300px min width before wrapping.
          </p>
          <GridLayout>
            <Tile label="Item A" />
            <Tile label="Item B" />
            <Tile label="Item C" />
            <Tile label="Item D" />
          </GridLayout>
        </section>
        <section>
          <h3 style={{ marginBottom: '0.75rem' }}>
            colWidth 180, gap var(--p-4)
          </h3>
          <GridLayout colWidth={180} gap="var(--p-4)">
            <Tile label="Narrow 1" />
            <Tile label="Narrow 2" />
            <Tile label="Narrow 3" />
          </GridLayout>
        </section>
      </PageContentSection>
    </>
  );
}
