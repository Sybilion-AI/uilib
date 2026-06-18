import { FlickeringGrid } from '#uilib/components/ui/FlickeringGrid';
import FlickeringGridGuidance from '#uilib/components/ui/FlickeringGrid/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance source={FlickeringGridGuidance} />
      <PageContentSection
        style={{ height: 200, position: 'relative', overflow: 'hidden' }}
      >
        <FlickeringGrid className="" />
      </PageContentSection>
    </>
  );
}
