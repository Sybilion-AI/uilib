import { Foldable } from '#uilib/components/ui/Foldable';
import FoldableGuidance from '#uilib/components/ui/Foldable/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance source={FoldableGuidance} />
      <PageContentSection style={{ width: '300px' }}>
        <Foldable
          header={<span>Click to expand</span>}
          content={<p style={{ margin: 0 }}>Hidden content inside.</p>}
          defaultUnfolded
        />
        <br />
        <Foldable
          header={<span>Clear variant</span>}
          content={<p style={{ margin: 0 }}>Hidden content inside.</p>}
          variant="clear"
        />
      </PageContentSection>
    </>
  );
}
