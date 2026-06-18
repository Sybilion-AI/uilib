import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#uilib/components/ui/Avatar';
import AvatarGuidance from '#uilib/components/ui/Avatar/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function AvatarPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Avatar' }]}
        title="Avatar"
        subheader="Image with fallback initials."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={AvatarGuidance} />
      <PageContentSection
        style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
      >
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      </PageContentSection>
    </>
  );
}
