import { LegacyPlatformLink } from '#uilib/components/ui/LegacyPlatformLink';
import LegacyPlatformLinkGuidance from '#uilib/components/ui/LegacyPlatformLink/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance source={LegacyPlatformLinkGuidance} />
      <PageContentSection>
        <LegacyPlatformLink redirectPath="/v1/dashboard">
          Legacy platform link
        </LegacyPlatformLink>
      </PageContentSection>
    </>
  );
}
