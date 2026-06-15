import { LegacyPlatformLink } from '#uilib/components/ui/LegacyPlatformLink';
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
      <DocsGuidance
        overview="LegacyPlatformLink is an anchor that points at the legacy platform, building the destination from the API domain plus the redirectPath you supply. It renders as a styled link and accepts standard anchor props."
        whenToUse={[
          'To send users to a screen that still lives on the legacy platform, such as older dashboards.',
          'During migration, where some destinations exist only in the legacy product.',
        ]}
        whenNotToUse={[
          'For navigation within the current app; use the router link components instead.',
          'Once the destination has been migrated; replace the legacy link with an in-app route.',
        ]}
        doNotes={[
          'Pass only the path portion in redirectPath, such as /v1/dashboard; the domain is added for you.',
        ]}
      />
      <PageContentSection>
        <LegacyPlatformLink redirectPath="/v1/dashboard">
          Legacy platform link
        </LegacyPlatformLink>
      </PageContentSection>
    </>
  );
}
