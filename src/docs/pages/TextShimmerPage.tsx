import { TextShimmer } from '#uilib/components/ui/TextShimmer';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function TextShimmerPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'TextShimmer' }]}
        title="TextShimmer"
        subheader="Shimmer loading text."
        actions={<DocsHeaderActions />}
      />
      <TextShimmer>Generating…</TextShimmer>
    </>
  );
}
