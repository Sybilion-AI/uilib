import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#uilib/components/ui/Avatar';
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
      <DocsGuidance
        overview="Avatar displays a user or entity image with an automatic fallback to initials when the image is missing or fails to load. Compose it from AvatarImage and AvatarFallback."
        whenToUse={[
          'To represent a person or account in headers, lists, comments, or menus.',
          'When an image may be unavailable and a textual fallback is acceptable.',
        ]}
        whenNotToUse={[
          'For arbitrary illustrative imagery; use a plain image instead.',
          'To convey status on its own; pair it with a Badge or status indicator.',
        ]}
        doNotes={[
          'Always provide an AvatarFallback with one or two initials so the component degrades gracefully.',
        ]}
      />
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
