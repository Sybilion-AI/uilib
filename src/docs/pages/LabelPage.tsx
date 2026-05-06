import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
      <PageContentSection>
        <Label htmlFor="x">Example label</Label>
      </PageContentSection>
    </>
  );
}
