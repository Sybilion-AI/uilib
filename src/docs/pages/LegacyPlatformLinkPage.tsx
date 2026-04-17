import { LegacyPlatformLink } from '#uilib/components/ui/LegacyPlatformLink';

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
      <LegacyPlatformLink redirectPath="/v1/dashboard">
        Legacy platform link
      </LegacyPlatformLink>
    </>
  );
}
