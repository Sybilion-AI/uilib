import { LabelWithId } from '#uilib/components/ui/LabelWithId';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function LabelWithIdPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'LabelWithId' }]}
        title="LabelWithId"
        subheader="Label with stable id for anchors."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <LabelWithId id={42} label="Analysis label" />
      </PageContentSection>
    </>
  );
}
