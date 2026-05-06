import { LegacyPlatformLink } from '#uilib/components/ui/LegacyPlatformLink';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function LegacyPlatformLinkPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'LegacyPlatformLink' }]}
        title="LegacyPlatformLink"
        subheader="Link styled for legacy platform navigation."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <LegacyPlatformLink redirectPath="/v1/dashboard">
          Legacy platform link
        </LegacyPlatformLink>
      </PageContentSection>
    </>
  );
}
