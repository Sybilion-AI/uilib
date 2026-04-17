import { VimeoEmbed } from '#uilib/components/ui/VimeoEmbed';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
      <div style={{ maxWidth: 560 }}>
        <VimeoEmbed videoId="148751763" />
      </div>
    </>
  );
}
