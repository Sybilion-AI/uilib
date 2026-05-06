import { Image } from '#uilib/components/ui/Image';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
