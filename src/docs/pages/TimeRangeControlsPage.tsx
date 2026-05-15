import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { TimeRangeControls } from '#uilib/components/ui/TimeRangeControls';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
