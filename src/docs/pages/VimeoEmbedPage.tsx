import { PageContentSection } from '#uilib/components/ui/Page';
import { VimeoEmbed } from '#uilib/components/ui/VimeoEmbed';
import vimeoEmbedGuidance from '#uilib/docs/agent-guidance/vimeo-embed.md';

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
      <DocsGuidance source={vimeoEmbedGuidance} />
      <PageContentSection style={{ maxWidth: 560 }}>
        <VimeoEmbed videoId="148751763" />
      </PageContentSection>
    </>
  );
}
