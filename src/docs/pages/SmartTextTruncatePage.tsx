import { PageContentSection } from '#uilib/components/ui/Page';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const LONG =
  'Very-long-identifier-that-might-not-fit-in-a-narrow-container-without-smart-truncation';

export default function SmartTextTruncatePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'SmartTextTruncate' }]}
        title="SmartTextTruncate"
        subheader="Smart ellipsis for long strings."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ maxWidth: 200, border: '1px solid var(--border)', padding: 8 }}
      >
        <SmartTextTruncate>{LONG}</SmartTextTruncate>
      </PageContentSection>
    </>
  );
}
