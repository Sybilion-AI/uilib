import { PageContentSection } from '#uilib/components/ui/Page';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';
import textShimmerGuidance from '#uilib/components/ui/TextShimmer/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance source={textShimmerGuidance} />
      <PageContentSection>
        <span>
          <TextShimmer>Generating…</TextShimmer>
        </span>
      </PageContentSection>
    </>
  );
}
