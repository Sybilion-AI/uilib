import { PageContentSection } from '#uilib/components/ui/Page';
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
      <PageContentSection>
        <span>
          <TextShimmer>Generating…</TextShimmer>
        </span>
      </PageContentSection>
    </>
  );
}
