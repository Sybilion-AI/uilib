import type { DonutChartDatum } from '#uilib/components/ui/DonutChart';
import { DonutChart } from '#uilib/components/ui/DonutChart';
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
      <DocsGuidance
        overview="DonutChart shows how a small number of categories make up a whole. Each datum carries a key, value, and optional label and colour; the centre of the donut can display a headline figure with a caption. Tooltip and legend reuse the shared chart infrastructure."
        whenToUse={[
          'To show composition of a total across roughly two to six categories, such as portfolio allocation or sentiment share.',
          'When a single headline figure (the total) deserves prominence in the centre.',
        ]}
        whenNotToUse={[
          'For more than about six categories; slices become unreadable — use BarChart instead.',
          'For comparing values across groups or over time; a donut only conveys part-to-whole.',
        ]}
        doNotes={[
          'Order slices from largest to smallest so the chart reads clockwise.',
        ]}
      />
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
