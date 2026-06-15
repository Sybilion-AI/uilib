import type { CSSProperties } from 'react';

import { PageColumns, PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const demoBlockStyle: CSSProperties = {
  margin: 0,
  padding: 'var(--p-4)',
  borderRadius: 'var(--p-3)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--muted)',
};

function ColumnDemo({ label }: { label: string }) {
  return <p style={demoBlockStyle}>{label}</p>;
}

export default function PageColumnsPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'PageColumns' }]}
        title="PageColumns"
        subheader="Responsive row of columns; fill prop controls which column(s) grow past the default width cap on wide viewports."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="PageColumns lays out a responsive row of columns inside a page section. The fill prop controls which columns grow past the default width cap on wide viewports: all, left, or right."
        whenToUse={[
          'To place two or more content blocks side by side within a PageContentSection.',
          'For main-plus-aside layouts where one column should grow and the other stays at a fixed width.',
        ]}
        whenNotToUse={[
          'For card or tile grids; use GridLayout instead.',
          'For arbitrary flex layouts inside a component; PageColumns is a page-structure primitive.',
        ]}
        doNotes={[
          'Use fill="left" or fill="right" to keep a sidebar column at the default fixed width on wide screens.',
        ]}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '0.75rem' }}>
            fill=&quot;all&quot; (default)
          </h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Both columns grow; max-width cap is removed on stretched columns.
          </p>
          <PageColumns
            columns={[
              <ColumnDemo key="a" label="Column A" />,
              <ColumnDemo key="b" label="Column B" />,
            ]}
          />
        </section>
        <section>
          <h3 style={{ marginBottom: '0.75rem' }}>fill=&quot;left&quot;</h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
            }}
          >
            First column grows; second stays at the default fixed width on wide
            screens.
          </p>
          <PageColumns
            fill="left"
            columns={[
              <ColumnDemo key="a" label="Growing left column" />,
              <ColumnDemo key="b" label="Fixed sidebar" />,
            ]}
          />
        </section>
        <section>
          <h3 style={{ marginBottom: '0.75rem' }}>fill=&quot;right&quot;</h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Last column grows; first stays at the default fixed width on wide
            screens.
          </p>
          <PageColumns
            fill="right"
            columns={[
              <ColumnDemo key="a" label="Fixed sidebar" />,
              <ColumnDemo key="b" label="Growing right column" />,
            ]}
          />
        </section>
      </PageContentSection>
    </>
  );
}
