import type { DonutChartDatum } from '#uilib/components/ui/DonutChart';
import { DonutChart } from '#uilib/components/ui/DonutChart';
import DonutChartGuidance from '#uilib/components/ui/DonutChart/AGENT.md';
import { PageContentSection, SectionHeader } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const ALLOCATION: DonutChartDatum[] = [
  { key: 'equities', label: 'Equities', value: 4520 },
  { key: 'bonds', label: 'Bonds', value: 2780 },
  { key: 'commodities', label: 'Commodities', value: 1340 },
  { key: 'property', label: 'Property', value: 860 },
  { key: 'cash', label: 'Cash', value: 500 },
];

const ALLOCATION_TOTAL = ALLOCATION.reduce((sum, d) => sum + d.value, 0);

const SENTIMENT: DonutChartDatum[] = [
  {
    key: 'positive',
    label: 'Positive',
    value: 58,
    color: 'var(--status-positive)',
  },
  { key: 'neutral', label: 'Neutral', value: 27, color: 'var(--sb-slate-400)' },
  {
    key: 'negative',
    label: 'Negative',
    value: 15,
    color: 'var(--status-negative)',
  },
];

export default function DonutChartPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'DonutChart' }]}
        title="DonutChart"
        subheader="Part-to-whole donut chart with an optional centre figure."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={DonutChartGuidance} />
      <PageContentSection>
        <SectionHeader
          title="With centre label"
          description="Portfolio allocation with the total in the donut hole."
          withMargin
        />
        <DonutChart
          data={ALLOCATION}
          centerValue={ALLOCATION_TOTAL.toLocaleString()}
          centerCaption="Total (GBP k)"
        />
      </PageContentSection>
      <PageContentSection>
        <SectionHeader
          title="Custom colours"
          description="Sentiment share using status tokens, without a centre label."
          withMargin
        />
        <DonutChart data={SENTIMENT} innerRadius="55%" height={240} />
      </PageContentSection>
    </>
  );
}
