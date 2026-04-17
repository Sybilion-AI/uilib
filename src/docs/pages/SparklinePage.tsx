import { Sparkline } from '#uilib/components/ui/Sparkline';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
      <Sparkline data={DATA} width={120} height={36} showEndDot />
    </>
  );
}
