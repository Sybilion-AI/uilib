import { Label } from '#uilib/components/ui/Label';

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
      <Label htmlFor="x">Example label</Label>
    </>
  );
}
