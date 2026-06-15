import { Label } from '#uilib/components/ui/Label';
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
      <DocsGuidance
        overview="Label is the styled form label used across the library. Link it to its control with htmlFor so clicking the label focuses the field and assistive technology announces it."
        whenToUse={[
          'To caption any form control, including Input, Textarea, Select, Switch, and Checkbox.',
          'Whenever a control needs an accessible name that is also visible on screen.',
        ]}
        whenNotToUse={[
          'For section headings or general text; use heading elements or SectionHeader.',
          'As inline helper or error text; labels name the field, they do not explain it.',
        ]}
        doNotes={[
          'Keep labels short and descriptive, such as “Email address” rather than full sentences.',
        ]}
      />
      <PageContentSection>
        <Label htmlFor="x">Example label</Label>
      </PageContentSection>
    </>
  );
}
