import { Kicker } from '#uilib/components/ui/Kicker';
import KickerGuidance from '#uilib/components/ui/Kicker/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function KickerPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Kicker' }]}
        title="Kicker"
        subheader="Small eyebrow label that introduces a section or card."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={KickerGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Default</h3>
          <Kicker>Chips, tags, status indicators</Kicker>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>With dash</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>dash</code> to render the leading em-dash used across the
            design-system previews.
          </p>
          <Kicker dash>Signal card · product primitive</Kicker>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Above a heading</h3>
          <div>
            <Kicker dash>Quarterly outlook</Kicker>
            <h2 style={{ marginTop: '0.5rem' }}>Polymer demand</h2>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
