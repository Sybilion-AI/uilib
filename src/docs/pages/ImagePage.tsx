import { Image } from '#uilib/components/ui/Image';

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
      <Image
        url="https://picsum.photos/seed/uilib/400/240"
        alt="Sample"
        fallback={null}
        style={{ maxWidth: '100%', borderRadius: 8 }}
      />
    </>
  );
}
