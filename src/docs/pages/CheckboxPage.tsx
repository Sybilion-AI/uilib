import { Checkbox } from '#uilib/components/ui/Checkbox';
import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function CheckboxPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Checkbox' }]}
        title="Checkbox"
        subheader="Binary toggle with label."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <Checkbox id="c1" />
        <Label htmlFor="c1">Accept terms</Label>
      </PageContentSection>
    </>
  );
}
