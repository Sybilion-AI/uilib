import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { TimeRangeControls } from '#uilib/components/ui/TimeRangeControls';

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
      <DocsGuidance
        overview="TimeRangeControls renders a row of preset time range toggles, such as one month or one year, for switching the window of a chart. Control it with timeRange and onTimeRangeChange, and pass loading to disable the controls while data refreshes."
        whenToUse={[
          'Above or beside a time series chart to let users change the visible window.',
          'When a small set of preset ranges covers the common cases.',
        ]}
        whenNotToUse={[
          'When users need arbitrary start and end dates; use a date range picker instead.',
          'For switching between categories or views unrelated to time; use Tabs or ToggleGroup.',
        ]}
        doNotes={[
          'Set loading while data for a new range fetches, so users cannot trigger overlapping requests.',
        ]}
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
