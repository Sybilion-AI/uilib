import { PageContentSection } from '#uilib/components/ui/Page';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';

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
      <DocsGuidance
        overview="TextShimmer animates a shimmer effect across its text content to signal that an operation is in progress. It keeps the label readable while making the pending state obvious."
        whenToUse={[
          'To indicate an in-progress operation with a descriptive label, such as “Generating…”.',
          'For streaming or AI-generated content where text appears gradually.',
        ]}
        whenNotToUse={[
          'As a placeholder for unknown content; use Skeleton instead.',
          'On static text that is not associated with a loading state, where the animation would mislead.',
        ]}
      />
      <PageContentSection>
        <span>
          <TextShimmer>Generating…</TextShimmer>
        </span>
      </PageContentSection>
    </>
  );
}
