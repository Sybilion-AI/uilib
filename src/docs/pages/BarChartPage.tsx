import type {
  BarChartDatum,
  BarChartSeries,
} from '#uilib/components/ui/BarChart';
import { BarChart } from '#uilib/components/ui/BarChart';
import { PageContentSection, SectionHeader } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const REVENUE_BY_REGION: BarChartDatum[] = [
  { month: 'Jan', emea: 42, americas: 38, apac: 21 },
  { month: 'Feb', emea: 47, americas: 41, apac: 24 },
  { month: 'Mar', emea: 44, americas: 45, apac: 27 },
  { month: 'Apr', emea: 52, americas: 43, apac: 30 },
  { month: 'May', emea: 49, americas: 48, apac: 33 },
  { month: 'Jun', emea: 55, americas: 51, apac: 35 },
];

const REGION_SERIES: BarChartSeries[] = [
  { key: 'emea', label: 'EMEA' },
  { key: 'americas', label: 'Americas' },
  { key: 'apac', label: 'APAC' },
];

const ACCURACY_BY_MODEL: BarChartDatum[] = [
  { model: 'Baseline', accuracy: 62 },
  { model: 'Seasonal', accuracy: 71 },
  { model: 'Ensemble', accuracy: 79 },
  { model: 'Neural', accuracy: 84 },
];

const ACCURACY_SERIES: BarChartSeries[] = [
  { key: 'accuracy', label: 'Accuracy' },
];

const formatPercent = (value: number) => `${value}%`;

export default function BarChartPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'BarChart' }]}
        title="BarChart"
        subheader="Categorical bar chart with grouped and stacked modes."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="BarChart compares values across categories. Provide rows of data, a category key, and a list of series; choose vertical or horizontal orientation and grouped or stacked mode. Grid, axes, tooltip, and legend follow the shared chart styling."
        whenToUse={[
          'To compare discrete categories such as regions, models, or scenarios.',
          'Stacked mode when the per-category total matters as much as the breakdown.',
          'Horizontal orientation when category labels are long or there are many categories.',
        ]}
        whenNotToUse={[
          'For continuous time series; use ChartAreaInteractive or a line chart instead.',
          'For part-to-whole of a single total; use DonutChart.',
        ]}
        doNotes={[
          'Start the value axis at zero so bar lengths stay proportional.',
        ]}
      />
      <PageContentSection>
        <SectionHeader
          title="Grouped"
          description="Monthly revenue by region, side by side."
          withMargin
        />
        <BarChart
          data={REVENUE_BY_REGION}
          categoryKey="month"
          series={REGION_SERIES}
          height={280}
        />
      </PageContentSection>
      <PageContentSection>
        <SectionHeader
          title="Stacked"
          description="The same data stacked to emphasise monthly totals."
          withMargin
        />
        <BarChart
          data={REVENUE_BY_REGION}
          categoryKey="month"
          series={REGION_SERIES}
          mode="stacked"
          height={280}
        />
      </PageContentSection>
      <PageContentSection>
        <SectionHeader
          title="Horizontal"
          description="Single series with long category labels and formatted ticks."
          withMargin
        />
        <BarChart
          data={ACCURACY_BY_MODEL}
          categoryKey="model"
          series={ACCURACY_SERIES}
          orientation="horizontal"
          valueFormatter={formatPercent}
          showLegend={false}
          height={240}
        />
      </PageContentSection>
    </>
  );
}
