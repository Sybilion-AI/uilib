import { Chip } from '#uilib/components/ui/Chip';
import type { ChipVariant } from '#uilib/components/ui/Chip';
import ChipGuidance from '#uilib/components/ui/Chip/AGENT.md';
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
  'yellow',
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
      <DocsGuidance source={ChipGuidance} />
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
          <h3 style={{ marginBottom: '1rem' }}>Squared</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>squared</code> for compact label badges in lists, tables,
            and cards.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Chip variant="neutral" squared>
              Default
            </Chip>
            <Chip variant="line" squared>
              Outline
            </Chip>
            <Chip variant="negative" squared>
              Red
            </Chip>
            <Chip variant="positive" squared>
              Green
            </Chip>
            <Chip variant="yellow" squared>
              Yellow
            </Chip>
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
