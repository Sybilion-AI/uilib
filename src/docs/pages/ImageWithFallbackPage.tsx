import { ImageWithFallback } from '#uilib/components/ui/ImageWithFallback';
import ImageWithFallbackGuidance from '#uilib/components/ui/ImageWithFallback/AGENT.md';
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
      <DocsGuidance source={ImageWithFallbackGuidance} />
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
