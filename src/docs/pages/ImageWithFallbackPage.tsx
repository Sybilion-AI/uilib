import { ImageWithFallback } from '#uilib/components/ui/ImageWithFallback';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ImageWithFallbackPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ImageWithFallback' }]}
        title="ImageWithFallback"
        subheader="Image with fallback on error."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="ImageWithFallback renders an image from a URL and swaps in the provided fallback content when the image fails to load. The fallback can be any node, such as a placeholder icon or a short message."
        whenToUse={[
          'When image URLs come from external or user-supplied sources and may be broken.',
          'When the layout must stay intact even if an image never loads, such as in cards or lists.',
        ]}
        whenNotToUse={[
          'When the image is bundled with the app and guaranteed to exist; plain Image is enough.',
        ]}
        doNotes={[
          'Give the fallback the same footprint as the image so the layout does not jump on error.',
          'Keep fallback content simple, such as an icon or short label, rather than a detailed error message.',
        ]}
      />
      <PageContentSection>
        <p style={{ marginBottom: 12 }}>Broken URL shows fallback:</p>
        <ImageWithFallback
          url="https://invalid.example.com/missing.png"
          alt=""
          fallback={<span>Failed to load</span>}
          style={{
            width: 200,
            height: 120,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--muted)',
          }}
        />
      </PageContentSection>
    </>
  );
}
