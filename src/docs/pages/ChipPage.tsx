import { Chip } from '#uilib/components/ui/Chip';
import type { ChipVariant } from '#uilib/components/ui/Chip';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const VARIANTS: ChipVariant[] = [
  'neutral',
  'line',
  'active',
  'filled',
  'accent',
  'positive',
  'negative',
];

export default function ChipPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chip' }]}
        title="Chip"
        subheader="Status and delta capsule with filter, accent, and trend variants."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Chips are compact pill-shaped capsules for filters, status pills, version tags, and quantitative delta indicators. Unlike Badge, which stays general purpose, Chip carries status and delta semantics: the positive and negative variants sit outside the primary palette and are reserved for quantitative impact signals."
        whenToUse={[
          'To present a row of filter options, with the active variant marking the current selection.',
          'To flag live status, version tags, or deadlines with the neutral, accent, and filled variants.',
          'To show a quantitative delta or impact direction with the positive or negative variant, optionally with a trend arrow.',
        ]}
        whenNotToUse={[
          'For general-purpose labels without status or delta semantics; use Badge instead.',
          'For file attachments; use FileChip.',
          'As decoration; the status variants are reserved for quantitative signals only.',
        ]}
        doNotes={[
          'Keep chip labels short and in sentence case.',
          'Pair the positive and negative variants with a trend arrow or delta value so the direction reads at a glance.',
        ]}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Variants</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {VARIANTS.map(v => (
              <Chip key={v} variant={v}>
                {v}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Chip variant="line">All signals</Chip>
            <Chip variant="active">Polymers</Chip>
            <Chip variant="line">Energy</Chip>
            <Chip variant="line">Logistics</Chip>
            <Chip variant="line">Weather</Chip>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Status and tags</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Chip variant="neutral">Live</Chip>
            <Chip variant="accent">New · v2.3</Chip>
            <Chip variant="filled">Decision due T−48h</Chip>
            <Chip variant="line" style={{ color: 'var(--sb-slate-500)' }}>
              Archived
            </Chip>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Deltas</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Status chips sit outside the primary palette. Reserved for
            quantitative delta and impact signals — not decoration.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Chip variant="negative" trend="down">
              Negative impact
            </Chip>
            <Chip variant="positive" trend="up">
              Positive impact
            </Chip>
            <Chip variant="negative">▼ 3.4%</Chip>
            <Chip variant="positive">▲ 1.2%</Chip>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Dot</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            The neutral variant shows the 6px dot by default; pass{' '}
            <code>dot</code> to control it on any variant.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Chip variant="neutral">Live</Chip>
            <Chip variant="neutral" dot={false}>
              No dot
            </Chip>
            <Chip variant="line" dot>
              Streaming
            </Chip>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
