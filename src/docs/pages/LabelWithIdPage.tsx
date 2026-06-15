import { LabelWithId } from '#uilib/components/ui/LabelWithId';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance
        overview="LabelWithId renders a text label preceded by a small numeric id badge, giving entities such as analyses a stable, scannable reference. Passing an id of -1 hides the badge and shows the label alone."
        whenToUse={[
          'To display entities that users reference by number, such as analyses or saved items.',
          'In lists, selectors, or breadcrumbs where the id helps users match items across views.',
        ]}
        whenNotToUse={[
          'For plain text that has no meaningful numeric identifier; use ordinary text or Label.',
        ]}
      />
      <PageContentSection>
        <LabelWithId id={42} label="Analysis label" />
      </PageContentSection>
    </>
  );
}
