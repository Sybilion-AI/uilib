import { Chip } from '#uilib/components/ui/Chip';
import { PageContentSection } from '#uilib/components/ui/Page';
import { SignalCard } from '#uilib/components/ui/SignalCard';
import { Sparkline } from '#uilib/components/ui/Sparkline';
import { Activity, BarChart3, Clock, TrendingUp } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const SPARK_DATA = [12, 14, 13, 16, 18, 17, 21, 20, 24, 23, 26, 28];

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '0.75rem',
} as const;

export default function SignalCardPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'SignalCard' }]}
        title="SignalCard"
        subheader="Metric card with kicker, figure, delta chip, and sparkline slot."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="SignalCard is the product primitive for a single metric: an optional kicker and icon header, a large Manrope figure with unit and tolerance suffixes, body copy, a sparkline slot, and a footer with a delta indicator and muted meta items. Weight carries the emphasis in the numeric block, not colour."
        whenToUse={[
          'To present a forecast, spot price, or index value with its direction and confidence.',
          'In a dashboard grid where each card answers one quantitative question.',
        ]}
        whenNotToUse={[
          'For general grouped content without a headline metric; use Card.',
          'For dense tabular comparisons across many series; use Table.',
        ]}
        doNotes={[
          'Keep the footer meta short, such as horizon and confidence.',
          'Pass a Chip with a status variant as the delta so direction reads at a glance.',
        ]}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Forecast and spot cards</h3>
          <div style={GRID_STYLE}>
            <SignalCard
              icon={<TrendingUp strokeWidth={1.5} />}
              title="March 2025"
              subtitle="Summary"
              value="1.006"
              unit="M"
              tolerance="± 0.001"
              description="If energy pressures, trade fragility, and climate disruptions persist, PVC additive demand is likely to remain flat or decline."
            />
            <SignalCard
              icon={<Activity strokeWidth={1.5} />}
              title="Propylene · Rotterdam"
              subtitle="Spot · 48h horizon"
              value="€1,180"
              unit="/t"
              delta={
                <Chip variant="positive" trend="up">
                  3.4%
                </Chip>
              }
              meta={['48h', 'conf 0.82']}
            />
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Footer deltas</h3>
          <div style={GRID_STYLE}>
            <SignalCard
              icon={<Clock strokeWidth={1.5} />}
              title="Gas · TTF front-month"
              subtitle="Continuous · 48h"
              value="€42.1"
              unit="/MWh"
              delta={
                <Chip variant="negative" trend="down">
                  1.2%
                </Chip>
              }
              meta={['48h', 'conf 0.76']}
            />
            <SignalCard
              icon={<BarChart3 strokeWidth={1.5} />}
              title="Freight · Baltic Dry"
              subtitle="Index · daily"
              value="1,642"
              unit="pts"
              delta={
                <Chip variant="positive" trend="up">
                  0.9%
                </Chip>
              }
              meta={['24h', 'conf 0.68']}
            />
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Kicker and sparkline</h3>
          <div style={GRID_STYLE}>
            <SignalCard
              kicker="Signal · active"
              title="PVC additives"
              subtitle="Demand index · weekly"
              value="128.4"
              unit="pts"
              sparkline={<Sparkline data={SPARK_DATA} height={36} />}
              delta={
                <Chip variant="positive" trend="up">
                  2.1%
                </Chip>
              }
              meta={['7d', 'conf 0.71']}
            />
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
