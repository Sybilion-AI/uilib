import { PageContentSection } from '#uilib/components/ui/Page';
import { VimeoEmbed } from '#uilib/components/ui/VimeoEmbed';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function VimeoEmbedPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'VimeoEmbed' }]}
        title="VimeoEmbed"
        subheader="Vimeo player embed."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="VimeoEmbed renders a responsive Vimeo player from a video ID, handling the iframe markup and aspect ratio for you. Constrain its width with the surrounding container."
        whenToUse={[
          'To embed product videos, tutorials, or demos hosted on Vimeo.',
          'When a consistent, responsive player is needed without writing iframe markup by hand.',
        ]}
        whenNotToUse={[
          'For video hosted elsewhere or self-hosted files; use the appropriate player or a video element.',
          'For decorative background video, which needs autoplay and loop control beyond an embedded player.',
        ]}
      />
      <PageContentSection style={{ maxWidth: 560 }}>
        <VimeoEmbed videoId="148751763" />
      </PageContentSection>
    </>
  );
}
