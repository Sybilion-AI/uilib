import { FlickeringGrid } from '#uilib/components/ui/FlickeringGrid';

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
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        <FlickeringGrid className="" />
      </div>
    </>
  );
}
