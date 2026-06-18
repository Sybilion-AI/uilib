import { Label } from '#uilib/components/ui/Label';
import LabelGuidance from '#uilib/components/ui/Label/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function LabelPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Label' }]}
        title="Label"
        subheader="Form label."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={LabelGuidance} />
      <PageContentSection>
        <Label htmlFor="x">Example label</Label>
      </PageContentSection>
    </>
  );
}
