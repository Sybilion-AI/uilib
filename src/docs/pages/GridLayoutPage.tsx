import type { CSSProperties } from 'react';

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
      <DocsGuidance
        overview="GridLayout is a responsive CSS grid that fits as many columns as the container allows, with each cell keeping at least colWidth before wrapping to a new row. Adjust spacing with the gap prop and change the root element with the polymorphic as prop."
        whenToUse={[
          'To lay out cards, tiles, or widgets in a dashboard-style grid inside a page section.',
          'When the number of items varies and the grid should adapt to the viewport without media queries.',
        ]}
        whenNotToUse={[
          'For two fixed page columns such as main content plus an aside; use PageColumns.',
          'For a fixed 3–4 column content row with equal peers; use PageColumns without fill.',
          'For items of very different sizes that need manual placement; use custom CSS grid instead.',
        ]}
        doNotes={[
          'Tune colWidth to the smallest width at which a tile still reads comfortably.',
          'Use spacing tokens such as var(--p-4) for the gap to stay consistent with the rest of the page.',
        ]}
      />
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
