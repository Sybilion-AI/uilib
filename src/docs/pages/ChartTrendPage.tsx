import { ChartTrend } from '#uilib/components/ui/ChartTrend';
import type {
  MeanCPDData,
  TimeSeriesPoint,
} from '#uilib/components/ui/ChartTrend/ChartTrend.types';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const HISTORICAL: TimeSeriesPoint[] = [
  ['2022-01-01', 100],
  ['2022-02-01', 102],
  ['2022-03-01', 101],
  ['2022-04-01', 105],
];

const MEAN_CPD: MeanCPDData = {
  change_points: [
    {
      sign: 1,
      prev_coef: [100],
      prev_period_est: [
        ['2022-01-01', 100],
        ['2022-02-01', 101],
      ],
      next_period_est: [
        ['2022-03-01', 103],
        ['2022-04-01', 105],
      ],
    },
  ],
  cpd_metrics: {
    sensitivity_threshold: 5,
    fc_metrics: { recall: 0.9 },
    consistency_metrics: {
      fc_ignore_noise_class: 0,
      fc_with_noise_class: 0,
    },
  },
};

export default function ChartTrendPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ChartTrend' }]}
        title="ChartTrend"
        subheader="Mean change-point trend with historical average."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <ChartTrend
          historicalData={HISTORICAL}
          meanCPD={MEAN_CPD}
          trendType="mean"
          showAnnotations
          loading={false}
          isDarkTheme={false}
          height={320}
        />
      </PageContentSection>
    </>
  );
}
