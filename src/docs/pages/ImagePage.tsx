import { Image } from '#uilib/components/ui/Image';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ImagePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Image' }]}
        title="Image"
        subheader="Responsive image wrapper."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Image is a thin wrapper around the native img element that loads a remote URL and accepts a fallback for when the request fails. Use it as the standard way to render external images in the library."
        whenToUse={[
          'To display remote images such as article thumbnails or user-provided media.',
          'When you want a consistent image element with built-in fallback support.',
        ]}
        whenNotToUse={[
          'When you need visible error handling with custom fallback content; use ImageWithFallback.',
          'For purely decorative backgrounds; prefer CSS backgrounds so they stay out of the accessibility tree.',
        ]}
        doNotes={[
          'Always provide meaningful alt text, or an empty alt for decorative images.',
          'Constrain the image with max-width or explicit dimensions to avoid layout shift.',
        ]}
      />
      <PageContentSection>
        <Image
          url="https://picsum.photos/seed/uilib/400/240"
          alt="Sample"
          fallback={null}
          style={{ maxWidth: '100%', borderRadius: 8 }}
        />
      </PageContentSection>
    </>
  );
}
