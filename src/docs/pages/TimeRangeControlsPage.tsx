import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { TimeRangeControls } from '#uilib/components/ui/TimeRangeControls';
import timeRangeControlsGuidance from '#uilib/components/ui/TimeRangeControls/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function TimeRangeControlsPage() {
  const [range, setRange] = useState<string>('1y');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'TimeRangeControls' }]}
        title="TimeRangeControls"
        subheader="Chart time range toggles."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={timeRangeControlsGuidance} />
      <PageContentSection>
        <TimeRangeControls
          timeRange={range}
          onTimeRangeChange={setRange}
          loading={false}
        />
      </PageContentSection>
    </>
  );
}
