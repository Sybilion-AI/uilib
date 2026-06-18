import ChartGuidance from '#uilib/components/ui/Chart/AGENT.md';
import { ChartExample } from '#uilib/components/ui/Chart/Chart.example';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ChartPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chart' }]}
        title="Chart"
        subheader="ChartContainer + Recharts line chart."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={ChartGuidance} />
      <ChartExample />
    </>
  );
}
