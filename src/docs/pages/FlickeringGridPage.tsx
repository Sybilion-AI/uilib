import { FlickeringGrid } from '#uilib/components/ui/FlickeringGrid';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function FlickeringGridPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'FlickeringGrid' }]}
        title="FlickeringGrid"
        subheader="Decorative animated grid background."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ height: 200, position: 'relative', overflow: 'hidden' }}
      >
        <FlickeringGrid className="" />
      </PageContentSection>
    </>
  );
}
