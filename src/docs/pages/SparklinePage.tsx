import { PageContentSection } from '#uilib/components/ui/Page';
import { Sparkline } from '#uilib/components/ui/Sparkline';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const DATA = [2, 5, 3, 8, 6, 9, 7, 10];

export default function SparklinePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Sparkline' }]}
        title="Sparkline"
        subheader="Compact line chart."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Sparkline renders a compact line chart from an array of numbers, sized to fit inline alongside text or inside table cells and cards. Use showEndDot to emphasise the most recent value."
        whenToUse={[
          'To show the trend of a metric at a glance, such as price or activity over time.',
          'Inside dense layouts — table rows, KPI cards, or list items — where a full chart would not fit.',
        ]}
        whenNotToUse={[
          'When users need axes, labels, or precise values; use a full chart component instead.',
          'For comparing many series against each other; sparklines carry no scale.',
        ]}
        doNotes={[
          'Pair the sparkline with the current value or a delta so the trend has context.',
        ]}
      />
      <PageContentSection>
        <Sparkline data={DATA} width={120} height={36} showEndDot />
      </PageContentSection>
    </>
  );
}
