import { Kicker } from '#uilib/components/ui/Kicker';
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
      <DocsGuidance
        overview="Kicker is a small eyebrow label rendered above a heading, card, or section. It uses the 12px Manrope label style in sentence case with zero tracking; emphasis comes from weight, never from uppercase."
        whenToUse={[
          'Above a heading or card to name the topic or category at a glance.',
          'As the eyebrow line of a SignalCard or editorial block.',
        ]}
        whenNotToUse={[
          'As a heading in its own right; pair it with a real heading element.',
          'For interactive labels such as filters or status pills; use Chip instead.',
        ]}
        dontNotes={[
          'Do not set kicker text in uppercase or small caps; keep sentence case.',
          'Do not add letter-spacing; small text keeps zero tracking.',
        ]}
      />
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
