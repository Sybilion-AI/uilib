import { Foldable } from '#uilib/components/ui/Foldable';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function FoldablePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Foldable' }]}
        title="Foldable"
        subheader="Expandable section with header."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <Foldable
          header={<span>Click to expand</span>}
          content={<p style={{ margin: 0 }}>Hidden content inside.</p>}
          defaultUnfolded
        />
      </PageContentSection>
    </>
  );
}
