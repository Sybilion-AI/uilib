import { PageContentSection } from '#uilib/components/ui/Page';
import { PullQuote } from '#uilib/components/ui/PullQuote';
import pullQuoteGuidance from '#uilib/docs/agent-guidance/pull-quote.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function PullQuotePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'PullQuote' }]}
        title="PullQuote"
        subheader="Editorial quote with accent rule and sentence-case attribution."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={pullQuoteGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Default</h3>
          <PullQuote
            attribution="Marta Linden"
            attributionRole="Head of procurement, KD Feddersen"
          >
            Sybilion moved our procurement committee&apos;s confidence earlier —
            we locked a propylene contract 11 days before the market caught up.
          </PullQuote>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Without attribution</h3>
          <PullQuote>
            Forecasts are only useful when they arrive before the decision.
          </PullQuote>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Attribution only</h3>
          <PullQuote attribution="Procurement weekly, May 2026">
            Signal quality beats signal quantity in every committee we surveyed.
          </PullQuote>
        </section>
      </PageContentSection>
    </>
  );
}
